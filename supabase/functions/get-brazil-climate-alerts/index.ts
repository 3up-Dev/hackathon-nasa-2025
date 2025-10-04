import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClimateEvent {
  type: 'drought' | 'flood' | 'heat' | 'cold' | 'pest' | 'fire' | 'storm';
  severity: 'low' | 'medium' | 'high';
  description: { pt: string; en: string };
  impact: {
    health: number;
    water: number;
    sustainability: number;
  };
  source?: string;
  detectedAt?: string;
}

// State boundaries approximation (simplified for filtering)
const STATE_BOUNDARIES: Record<string, { minLat: number; maxLat: number; minLon: number; maxLon: number }> = {
  AC: { minLat: -11.0, maxLat: -7.0, minLon: -74.0, maxLon: -66.5 },
  AM: { minLat: -9.8, maxLat: 2.3, minLon: -73.8, maxLon: -56.1 },
  RR: { minLat: -1.0, maxLat: 5.3, minLon: -64.8, maxLon: -59.0 },
  PA: { minLat: -9.8, maxLat: 2.6, minLon: -58.9, maxLon: -46.0 },
  AP: { minLat: -2.0, maxLat: 5.0, minLon: -54.9, maxLon: -49.8 },
  TO: { minLat: -13.5, maxLat: -5.2, minLon: -50.7, maxLon: -45.7 },
  RO: { minLat: -13.7, maxLat: -7.9, minLon: -66.0, maxLon: -59.8 },
  MA: { minLat: -10.3, maxLat: -1.0, minLon: -48.7, maxLon: -41.8 },
  PI: { minLat: -10.9, maxLat: -2.7, minLon: -45.9, maxLon: -40.4 },
  CE: { minLat: -7.9, maxLat: -2.8, minLon: -41.4, maxLon: -37.2 },
  RN: { minLat: -6.9, maxLat: -4.8, minLon: -38.6, maxLon: -34.9 },
  PB: { minLat: -8.3, maxLat: -6.0, minLon: -38.8, maxLon: -34.8 },
  PE: { minLat: -9.5, maxLat: -7.3, minLon: -41.4, maxLon: -34.8 },
  AL: { minLat: -10.5, maxLat: -8.8, minLon: -38.2, maxLon: -35.2 },
  SE: { minLat: -11.6, maxLat: -9.5, minLon: -38.2, maxLon: -36.4 },
  BA: { minLat: -18.3, maxLat: -8.5, minLon: -46.6, maxLon: -37.3 },
  MT: { minLat: -18.0, maxLat: -7.3, minLon: -61.6, maxLon: -50.2 },
  MS: { minLat: -24.1, maxLat: -17.2, minLon: -58.2, maxLon: -50.9 },
  GO: { minLat: -19.5, maxLat: -12.4, minLon: -53.2, maxLon: -45.9 },
  DF: { minLat: -16.0, maxLat: -15.5, minLon: -48.3, maxLon: -47.4 },
  SP: { minLat: -25.3, maxLat: -19.8, minLon: -53.1, maxLon: -44.2 },
  RJ: { minLat: -23.4, maxLat: -20.8, minLon: -44.9, maxLon: -40.9 },
  MG: { minLat: -22.9, maxLat: -14.2, minLon: -51.0, maxLon: -39.9 },
  ES: { minLat: -21.3, maxLat: -17.9, minLon: -41.9, maxLon: -39.7 },
  PR: { minLat: -26.7, maxLat: -22.5, minLon: -54.6, maxLon: -48.0 },
  SC: { minLat: -29.4, maxLat: -25.9, minLon: -53.8, maxLon: -48.3 },
  RS: { minLat: -33.8, maxLat: -27.1, minLon: -57.6, maxLon: -49.7 },
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { stateId } = await req.json();

    if (!stateId) {
      throw new Error('stateId is required');
    }

    console.log(`Fetching real-time climate alerts for state: ${stateId}`);

    const alerts: ClimateEvent[] = [];

    // 1. Fetch fire data from NASA FIRMS
    try {
      const firmsKey = Deno.env.get('NASA_FIRMS_MAP_KEY');
      if (firmsKey) {
        console.log('Fetching NASA FIRMS fire data...');
        const firmsUrl = `https://firms.modaps.eosdis.nasa.gov/api/country/csv/${firmsKey}/VIIRS_SNPP_NRT/BRA/1`;
        
        const firmsResponse = await fetch(firmsUrl);
        
        if (firmsResponse.ok) {
          const csvData = await firmsResponse.text();
          const lines = csvData.split('\n').slice(1); // Skip header
          
          // Filter fires within state boundaries
          const stateBounds = STATE_BOUNDARIES[stateId];
          let fireCount = 0;
          
          if (stateBounds) {
            for (const line of lines) {
              if (!line.trim()) continue;
              
              const parts = line.split(',');
              if (parts.length < 3) continue;
              
              const lat = parseFloat(parts[0]);
              const lon = parseFloat(parts[1]);
              
              if (
                lat >= stateBounds.minLat &&
                lat <= stateBounds.maxLat &&
                lon >= stateBounds.minLon &&
                lon <= stateBounds.maxLon
              ) {
                fireCount++;
              }
            }
          }
          
          console.log(`Found ${fireCount} fire hotspots in ${stateId}`);
          
          // Create fire alert based on hotspot count
          if (fireCount >= 10) {
            alerts.push({
              type: 'fire',
              severity: 'high',
              description: {
                pt: `🔥 Alto risco de queimadas: ${fireCount} focos detectados nas últimas 24h`,
                en: `🔥 High fire risk: ${fireCount} hotspots detected in last 24h`,
              },
              impact: {
                health: -20,
                water: 100,
                sustainability: -15,
              },
              source: 'NASA_FIRMS',
              detectedAt: new Date().toISOString(),
            });
          } else if (fireCount >= 5) {
            alerts.push({
              type: 'fire',
              severity: 'medium',
              description: {
                pt: `🔥 Risco moderado de queimadas: ${fireCount} focos detectados nas últimas 24h`,
                en: `🔥 Moderate fire risk: ${fireCount} hotspots detected in last 24h`,
              },
              impact: {
                health: -10,
                water: 50,
                sustainability: -8,
              },
              source: 'NASA_FIRMS',
              detectedAt: new Date().toISOString(),
            });
          } else if (fireCount >= 1) {
            alerts.push({
              type: 'fire',
              severity: 'low',
              description: {
                pt: `🔥 Focos de queimada detectados: ${fireCount} nas últimas 24h`,
                en: `🔥 Fire hotspots detected: ${fireCount} in last 24h`,
              },
              impact: {
                health: -5,
                water: 20,
                sustainability: -3,
              },
              source: 'NASA_FIRMS',
              detectedAt: new Date().toISOString(),
            });
          }
        } else {
          console.warn('FIRMS API returned non-OK status:', firmsResponse.status);
        }
      } else {
        console.warn('NASA_FIRMS_MAP_KEY not configured');
      }
    } catch (error) {
      console.error('Error fetching FIRMS data:', error);
    }

    // 2. Fetch meteorological alerts from INMET
    try {
      console.log('Fetching INMET alerts...');
      // Note: INMET API endpoint may need validation/adjustment
      const inmetUrl = 'https://apiprevmet3.inmet.gov.br/avisos/ativos';
      
      const inmetResponse = await fetch(inmetUrl, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (inmetResponse.ok) {
        const inmetData = await inmetResponse.json();
        console.log('INMET data received:', inmetData);
        
        // Parse INMET alerts (format may vary - adjust as needed)
        if (Array.isArray(inmetData)) {
          for (const alert of inmetData) {
            // Check if alert affects the requested state
            const affectedStates = alert.estados || alert.states || [];
            
            if (affectedStates.includes(stateId)) {
              const severity = alert.nivel === 'Perigo' ? 'high' : alert.nivel === 'Alerta' ? 'medium' : 'low';
              const alertType = alert.fenomeno?.toLowerCase() || 'storm';
              
              let eventType: ClimateEvent['type'] = 'storm';
              if (alertType.includes('chuva')) {
                eventType = alertType.includes('intens') ? 'flood' : 'storm';
              } else if (alertType.includes('seca')) {
                eventType = 'drought';
              } else if (alertType.includes('calor')) {
                eventType = 'heat';
              } else if (alertType.includes('frio') || alertType.includes('geada')) {
                eventType = 'cold';
              }
              
              alerts.push({
                type: eventType,
                severity,
                description: {
                  pt: `⛈️ Alerta INMET: ${alert.descricao || alert.description || 'Condições meteorológicas adversas'}`,
                  en: `⛈️ INMET Alert: ${alert.description || 'Adverse weather conditions'}`,
                },
                impact: {
                  health: severity === 'high' ? -15 : severity === 'medium' ? -10 : -5,
                  water: eventType === 'flood' ? -30 : eventType === 'drought' ? 80 : 0,
                  sustainability: -8,
                },
                source: 'INMET',
                detectedAt: new Date().toISOString(),
              });
            }
          }
        }
      } else {
        console.warn('INMET API returned non-OK status:', inmetResponse.status);
      }
    } catch (error) {
      console.error('Error fetching INMET data:', error);
      // INMET API may not be available or require different approach
    }

    console.log(`Total alerts found: ${alerts.length}`);

    return new Response(
      JSON.stringify({
        stateId,
        alerts,
        lastUpdated: Date.now(),
        sources: [...new Set(alerts.map((a) => a.source).filter(Boolean))],
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in get-brazil-climate-alerts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
