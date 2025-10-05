/**
 * Este arquivo foi desenvolvido com assistência de Inteligência Artificial.
 * Hook para buscar dados climáticos da NASA POWER API.
 * 
 * This file was developed with Artificial Intelligence assistance.
 * Hook for fetching climate data from NASA POWER API.
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BrazilState } from '@/data/states';

interface ClimateData {
  temperature: number;
  precipitation: number;
  humidity: number;
  isRealData: boolean;
}

interface UseClimateDataResult {
  data: ClimateData | null;
  loading: boolean;
  error: string | null;
}

const cache = new Map<string, { data: ClimateData; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const useClimateData = (state: BrazilState | null, enabled = false): UseClimateDataResult => {
  const [data, setData] = useState<ClimateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state || !enabled) {
      setData(null);
      return;
    }

    const fetchClimateData = async () => {
      const cacheKey = `${state.lat},${state.lon}`;
      
      // Check cache first
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('Using cached climate data for', state.name);
        setData(cached.data);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('Fetching NASA climate data for', state.name);
        
        const { data: climateData, error: functionError } = await supabase.functions.invoke(
          'get-nasa-climate-data',
          {
            body: {
              latitude: state.lat,
              longitude: state.lon,
            },
          }
        );

        if (functionError) {
          throw functionError;
        }

        if (climateData.error) {
          throw new Error(climateData.error);
        }

        console.log('NASA climate data received:', climateData);

        // Cache the result
        cache.set(cacheKey, {
          data: climateData,
          timestamp: Date.now(),
        });

        setData(climateData);
      } catch (err) {
        console.error('Error fetching climate data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        
        // Fallback to simulated data
        setData({
          temperature: state.temp,
          precipitation: state.rain,
          humidity: 70,
          isRealData: false,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClimateData();
  }, [state, enabled]);

  return { data, loading, error };
};
