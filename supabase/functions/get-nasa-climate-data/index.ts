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

    // Calculate date range - use historical data from same period last year if future dates
    let startDate: Date;
    let endDate: Date;
    const today = new Date();
    
    if (reqStartDate && reqEndDate) {
      startDate = new Date(reqStartDate);
      endDate = new Date(reqEndDate);
      
      // If dates are in the future, shift them to last year's same period
      if (endDate > today) {
        const daysInFuture = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        startDate = new Date(startDate.getTime() - (365 * 24 * 60 * 60 * 1000));
        endDate = new Date(today.getTime() - (daysInFuture * 24 * 60 * 60 * 1000));
      }
    } else if (daysCount) {
      endDate = new Date(today);
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - daysCount);
    } else {
      // Default: last 30 days
      endDate = new Date(today);
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 30);
    }

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

    // Filter out -999 (missing data indicator) and ensure numbers
    const validTemps = temps.filter(t => typeof t === 'number' && !isNaN(t) && t !== -999 && t > -100 && t < 100);
    const validPrecips = precips.filter(p => typeof p === 'number' && !isNaN(p) && p !== -999 && p >= 0);
    const validHumidities = humidities.filter(h => typeof h === 'number' && !isNaN(h) && h !== -999 && h >= 0 && h <= 100);
    const validET = evapotranspirations.filter(e => typeof e === 'number' && !isNaN(e) && e !== -999 && e >= 0);

    console.log(`Valid data points - Temps: ${validTemps.length}, Precips: ${validPrecips.length}, Humidity: ${validHumidities.length}, ET: ${validET.length}`);

    if (validTemps.length === 0 || validPrecips.length === 0) {
      throw new Error('No valid climate data available for this location');
    }

    const avgTemp = validTemps.reduce((a, b) => a + b, 0) / validTemps.length;
    const totalPrecip = validPrecips.reduce((a, b) => a + b, 0);
    const avgHumidity = validHumidities.length > 0 
      ? validHumidities.reduce((a, b) => a + b, 0) / validHumidities.length 
      : 70;
    const avgET = validET.length > 0
      ? validET.reduce((a, b) => a + b, 0) / validET.length
      : 4.0;

    // Detect climate anomalies
    const anomalies: ClimateAnomalies = {
      drought: totalPrecip < (validPrecips.length * 2), // Less than 2mm per day average
      flood: totalPrecip > (validPrecips.length * 15), // More than 15mm per day average
      heatWave: avgTemp > 35,
      coldSnap: avgTemp < 10,
    };

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
