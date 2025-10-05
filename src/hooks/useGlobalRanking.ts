/**
 * Este arquivo foi desenvolvido com assistência de Inteligência Artificial.
 * Toda a lógica, estrutura e implementação foram revisadas e validadas pela equipe humana.
 * 
 * This file was developed with Artificial Intelligence assistance.
 * All logic, structure, and implementation were reviewed and validated by the human team.
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getMedalType } from '@/data/gameLogic';

export interface RankingEntry {
  id: string;
  username?: string;
  profile_name: string;
  crop_id: string;
  sector: string;
  state_id: string;
  total_score: number;
  ranking_position: number;
  medal: 'gold' | 'silver' | 'bronze';
}

export interface GlobalStats {
  totalPlayers: number;
  averageScore: number;
}

export interface UseGlobalRankingReturn {
  rankings: RankingEntry[];
  currentUserPosition: number | null;
  globalStats: GlobalStats;
  loading: boolean;
  error: string | null;
}

export const useGlobalRanking = (currentProfileId?: string): UseGlobalRankingReturn => {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [currentUserPosition, setCurrentUserPosition] = useState<number | null>(null);
  const [globalStats, setGlobalStats] = useState<GlobalStats>({ totalPlayers: 0, averageScore: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch top 50 rankings
        const { data, error: fetchError } = await supabase
          .from('public_rankings')
          .select('*')
          .order('total_score', { ascending: false })
          .order('last_played_at', { ascending: false })
          .limit(50);

        if (fetchError) throw fetchError;

        // Transform data and add medals
        const rankingsWithMedals: RankingEntry[] = (data || []).map((entry) => ({
          ...entry,
          medal: getMedalType(entry.total_score),
        }));

        setRankings(rankingsWithMedals);

        // Calculate global stats
        if (data && data.length > 0) {
          const totalScore = data.reduce((sum, entry) => sum + entry.total_score, 0);
          setGlobalStats({
            totalPlayers: data.length,
            averageScore: Math.round(totalScore / data.length),
          });
        }

        // Find current user position if profileId provided
        if (currentProfileId) {
          const userEntry = rankingsWithMedals.find(entry => entry.id === currentProfileId);
          setCurrentUserPosition(userEntry ? userEntry.ranking_position : null);
        }

      } catch (err) {
        console.error('Error fetching rankings:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar ranking');
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [currentProfileId]);

  return {
    rankings,
    currentUserPosition,
    globalStats,
    loading,
    error,
  };
};
