import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NASAClimateData {
  temperature: number;
  precipitation: number;
  humidity: number;
  isRealData: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude } = await req.json();

    console.log('Fetching NASA POWER data for:', { latitude, longitude });

    // Get data from last 365 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 365);

    const startDateStr = startDate.toISOString().split('T')[0].replace(/-/g, '');
    const endDateStr = endDate.toISOString().split('T')[0].replace(/-/g, '');

    // NASA POWER API - Agricultural community
    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,PRECTOTCORR,RH2M&community=AG&longitude=${longitude}&latitude=${latitude}&start=${startDateStr}&end=${endDateStr}&format=JSON`;

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
    
    console.log(`Data points received - Temps: ${temps.length}, Precips: ${precips.length}, Humidity: ${humidities.length}`);

    // Filter out -999 (missing data indicator) and ensure numbers
    const validTemps = temps.filter(t => typeof t === 'number' && !isNaN(t) && t !== -999);
    const validPrecips = precips.filter(p => typeof p === 'number' && !isNaN(p) && p !== -999);
    const validHumidities = humidities.filter(h => typeof h === 'number' && !isNaN(h) && h !== -999);

    console.log(`Valid data points - Temps: ${validTemps.length}, Precips: ${validPrecips.length}, Humidity: ${validHumidities.length}`);

    if (validTemps.length === 0 || validPrecips.length === 0) {
      throw new Error('No valid climate data available for this location');
    }

    const avgTemp = validTemps.reduce((a, b) => a + b, 0) / validTemps.length;
    const totalPrecip = validPrecips.reduce((a, b) => a + b, 0);
    const avgHumidity = validHumidities.length > 0 
      ? validHumidities.reduce((a, b) => a + b, 0) / validHumidities.length 
      : 0;

    const result: NASAClimateData = {
      temperature: Math.round(avgTemp * 10) / 10,
      precipitation: Math.round(totalPrecip),
      humidity: Math.round(avgHumidity),
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
