import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClimateAnomalies {
  drought: boolean;
  flood: boolean;
  heatWave: boolean;
  coldSnap: boolean;
  fireRisk: boolean;
  stormRisk: boolean;
}

interface NASAClimateData {
  temperature: number;
  precipitation: number;
  humidity: number;
  evapotranspiration: number;
  anomalies: ClimateAnomalies;
  isRealData: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude, startDate: reqStartDate, endDate: reqEndDate, daysCount } = await req.json();

    console.log('Fetching NASA POWER data for:', { latitude, longitude, reqStartDate, reqEndDate, daysCount });

    // Calculate date range - NASA has ~2 day delay, use historical data
    let startDate: Date;
    let endDate: Date;
    const today = new Date();
    const nasaMaxDate = new Date(today);
    nasaMaxDate.setDate(nasaMaxDate.getDate() - 2); // NASA has 2-day delay
    
    if (reqStartDate && reqEndDate) {
      startDate = new Date(reqStartDate);
      endDate = new Date(reqEndDate);
      
      // If dates are in the future, shift exactly 1 year back
      if (endDate > nasaMaxDate) {
        console.log('Future dates detected, shifting to last year');
        startDate.setFullYear(startDate.getFullYear() - 1);
        endDate.setFullYear(endDate.getFullYear() - 1);
        // Ensure endDate is not beyond NASA's available data
        if (endDate > nasaMaxDate) {
          endDate = new Date(nasaMaxDate);
        }
      }
    } else if (daysCount) {
      endDate = new Date(nasaMaxDate);
      startDate = new Date(nasaMaxDate);
      startDate.setDate(startDate.getDate() - daysCount);
    } else {
      // Default: last 30 real days
      endDate = new Date(nasaMaxDate);
      startDate = new Date(nasaMaxDate);
      startDate.setDate(startDate.getDate() - 30);
    }

    console.log('Adjusted dates:', { 
      startDate: startDate.toISOString().split('T')[0], 
      endDate: endDate.toISOString().split('T')[0] 
    });

    const startDateStr = startDate.toISOString().split('T')[0].replace(/-/g, '');
    const endDateStr = endDate.toISOString().split('T')[0].replace(/-/g, '');

    // NASA POWER API - Agricultural community (added EVPTRNS for evapotranspiration)
    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,PRECTOTCORR,RH2M,EVPTRNS&community=AG&longitude=${longitude}&latitude=${latitude}&start=${startDateStr}&end=${endDateStr}&format=JSON`;

    console.log('NASA API URL:', url);

    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('NASA API error:', response.status, response.statusText);
      throw new Error(`NASA API returned ${response.status}`);
    }

    const data = await response.json();
    console.log('NASA API response received');

    // Validate response structure
    if (!data.parameters || !data.parameters.T2M || !data.parameters.PRECTOTCORR || !data.parameters.RH2M) {
      console.error('Invalid NASA API response structure:', JSON.stringify(data).substring(0, 500));
      throw new Error('Invalid NASA API response structure');
    }

    // Calculate averages from the daily data
    const temps = Object.values(data.parameters.T2M) as number[];
    const precips = Object.values(data.parameters.PRECTOTCORR) as number[];
    const humidities = Object.values(data.parameters.RH2M) as number[];
    const evapotranspirations = data.parameters.EVPTRNS ? Object.values(data.parameters.EVPTRNS) as number[] : [];
    
    console.log(`Data points received - Temps: ${temps.length}, Precips: ${precips.length}, Humidity: ${humidities.length}, ET: ${evapotranspirations.length}`);
    console.log('Raw sample data:', { 
      temps: temps.slice(0, 5), 
      precips: precips.slice(0, 5),
      humidities: humidities.slice(0, 5),
      et: evapotranspirations.slice(0, 5)
    });

    // Filter out -999 (missing data indicator) - relaxed filters for Amazon region
    const validTemps = temps.filter(t => typeof t === 'number' && !isNaN(t) && t !== -999);
    const validPrecips = precips.filter(p => typeof p === 'number' && !isNaN(p) && p !== -999 && p >= 0 && p < 500);
    const validHumidities = humidities.filter(h => typeof h === 'number' && !isNaN(h) && h !== -999 && h >= 0 && h <= 100);
    const validET = evapotranspirations.filter(e => typeof e === 'number' && !isNaN(e) && e !== -999 && e >= 0 && e <= 15);

    console.log(`Valid data points - Temps: ${validTemps.length}, Precips: ${validPrecips.length}, Humidity: ${validHumidities.length}, ET: ${validET.length}`);

    if (validTemps.length === 0 && validPrecips.length === 0) {
      console.error('No valid data after filtering. Trying fallback...');
      throw new Error('No valid climate data available for this location');
    }

    const avgTemp = validTemps.length > 0 
      ? validTemps.reduce((a, b) => a + b, 0) / validTemps.length 
      : 27; // Amazon average fallback
    const totalPrecip = validPrecips.length > 0 
      ? validPrecips.reduce((a, b) => a + b, 0) 
      : validPrecips.length * 5; // ~5mm/day fallback
    const avgHumidity = validHumidities.length > 0 
      ? validHumidities.reduce((a, b) => a + b, 0) / validHumidities.length 
      : 80; // Amazon is very humid
    const avgET = validET.length > 0
      ? validET.reduce((a, b) => a + b, 0) / validET.length
      : 4.0;

    console.log('Calculated averages:', { avgTemp, totalPrecip, avgHumidity, avgET });

    // Detect climate anomalies - adjusted for Amazon region
    const avgDailyPrecip = validPrecips.length > 0 ? totalPrecip / validPrecips.length : 5;
    const anomalies: ClimateAnomalies = {
      drought: avgDailyPrecip < 3, // Less than 3mm per day (Amazon is wetter)
      flood: avgDailyPrecip > 15, // More than 15mm per day average
      heatWave: avgTemp > 33, // Amazon rarely exceeds 35°C
      coldSnap: avgTemp < 18, // Adjusted for tropical climate
      fireRisk: avgTemp > 30 && avgHumidity < 40 && avgDailyPrecip < 3, // Adjusted for Amazon dry season
      stormRisk: avgDailyPrecip > 20, // Extreme precipitation
    };

    console.log('Detected anomalies:', anomalies);

    const result: NASAClimateData = {
      temperature: Math.round(avgTemp * 10) / 10,
      precipitation: Math.round(totalPrecip * 10) / 10,
      humidity: Math.round(avgHumidity),
      evapotranspiration: Math.round(avgET * 10) / 10,
      anomalies,
      isRealData: true,
    };

    console.log('Processed NASA data:', result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in get-nasa-climate-data:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        isRealData: false,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
