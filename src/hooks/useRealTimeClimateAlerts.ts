import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ClimateEvent } from '@/lib/productionEngine';

interface UseRealTimeClimateAlertsResult {
  alerts: ClimateEvent[];
  loading: boolean;
  error: string | null;
}

interface AlertsResponse {
  stateId: string;
  alerts: ClimateEvent[];
  lastUpdated: number;
  sources: string[];
}

const cache = new Map<string, { data: ClimateEvent[]; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const useRealTimeClimateAlerts = (
  stateId: string | null,
  enabled = false
): UseRealTimeClimateAlertsResult => {
  const [alerts, setAlerts] = useState<ClimateEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stateId || !enabled) {
      setAlerts([]);
      return;
    }

    const fetchAlerts = async () => {
      const cacheKey = stateId;

      // Check cache first
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('Using cached real-time alerts for', stateId);
        setAlerts(cached.data);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('Fetching real-time climate alerts for', stateId);

        const { data: alertsData, error: functionError } = await supabase.functions.invoke(
          'get-brazil-climate-alerts',
          {
            body: { stateId },
          }
        );

        if (functionError) {
          throw functionError;
        }

        if (alertsData.error) {
          throw new Error(alertsData.error);
        }

        const response = alertsData as AlertsResponse;
        console.log('Real-time alerts received:', response);

        // Cache the result
        cache.set(cacheKey, {
          data: response.alerts,
          timestamp: Date.now(),
        });

        setAlerts(response.alerts);
      } catch (err) {
        console.error('Error fetching real-time alerts:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Don't set empty alerts on error - keep existing ones
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [stateId, enabled]);

  return { alerts, loading, error };
};
