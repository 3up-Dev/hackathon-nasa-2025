/**
 * Este arquivo foi desenvolvido com assistência de Inteligência Artificial.
 * Toda a lógica, estrutura e implementação foram revisadas e validadas pela equipe humana.
 * 
 * This file was developed with Artificial Intelligence assistance.
 * All logic, structure, and implementation were reviewed and validated by the human team.
 */

import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { GameLayout } from '@/components/layout/GameLayout';
import { PixelButton } from '@/components/layout/PixelButton';
import { MedalBadge } from '@/components/game/MedalBadge';
import { IndicatorCard } from '@/components/game/IndicatorCard';
import { GlobalRanking } from '@/components/game/GlobalRanking';
import { useLanguage } from '@/hooks/useLanguage';
import { useGameState } from '@/hooks/useGameState';
import { useGameProfiles } from '@/hooks/useGameProfiles';
import { getMedalType } from '@/data/gameLogic';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Results() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { resetGame } = useGameState();
  const { currentProfile, loadProfiles } = useGameProfiles();
  const [infoOpen, setInfoOpen] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Carregar dados reais do perfil ativo do banco
  useEffect(() => {
    const loadActiveProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Buscar o perfil ativo do banco de dados
        const { data, error } = await supabase
          .from('game_profiles')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (error) {
          console.error('Error loading active profile:', error);
          setLoading(false);
          return;
        }

        console.log('📊 Loaded profile data from DB:', data);
        setProfileData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error in loadActiveProfile:', error);
        setLoading(false);
      }
    };

    loadActiveProfile();
    loadProfiles(); // Também recarrega os perfis no hook
  }, []);

  // Usar dados do perfil carregado ou fallback para currentProfile
  const activeProfile = profileData || currentProfile;
  const indicators = activeProfile?.indicators || { production: 10, sustainability: 10, water: 10 };
  const totalScore = activeProfile?.total_score || 0;
  const plantedStates = activeProfile?.planted_states || [];

  const medalType = getMedalType(totalScore);

  if (loading) {
    return (
      <GameLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-4xl animate-pulse">🌱</div>
        </div>
      </GameLayout>
    );
  }

  const handleReplay = () => {
    navigate('/profiles');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    resetGame();
    navigate('/');
  };

  return (
    <GameLayout>
      <div className="h-full bg-gradient-to-b from-game-bg to-game-green-400 to-opacity-20 overflow-auto">
        <div className="p-8 space-y-8">
          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/profiles')}
              className="font-sans text-sm text-game-gray-700 hover:text-game-fg transition-colors"
            >
              ← Voltar
            </button>
            <button
              onClick={handleLogout}
              className="font-sans text-sm text-game-gray-700 hover:text-game-fg transition-colors"
            >
              Sair →
            </button>
          </div>

          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h1 className="font-pixel text-base text-game-fg">{t('results_title')}</h1>
              <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
                <DialogTrigger asChild>
                  <button 
                    className="text-game-gray-700 hover:text-game-fg transition-colors"
                    aria-label="Informações sobre os resultados"
                  >
                    <Info className="w-5 h-5" />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-pixel text-game-fg">
                      {t('info_results_title')}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 font-sans text-sm text-game-gray-700">
                    <div>
                      <p className="font-semibold text-game-fg mb-1">🏅 {t('score_final')}</p>
                      <p>{t('info_medal_score')}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-game-fg mb-1">📈 {t('prod_total')}</p>
                      <p>{t('info_production')}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-game-fg mb-1">♻️ {t('sustentabilidade')}</p>
                      <p>{t('info_sustainability')}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-game-fg mb-1">💧 {t('agua')}</p>
                      <p>{t('info_water')}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-game-fg mb-1">🏆 {t('ranking_global')}</p>
                      <p>{t('info_global_ranking')}</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <p className="font-sans text-sm text-game-gray-700">
              {plantedStates.length > 0 ? (
                `${plantedStates.length} ${t('plants_planted')}`
              ) : (
                'Nenhuma produção concluída ainda'
              )}
            </p>
          </div>

          {/* Medal */}
          <div className="flex justify-center py-4">
            <MedalBadge type={medalType} />
          </div>

          {/* Score */}
          <div className="text-center">
            <p className="font-sans text-sm text-game-gray-700 mb-2">{t('score_final')}</p>
            <div className="inline-block bg-white rounded-2xl px-8 py-4 shadow-lg border-2 border-game-green-700">
              <p className="font-pixel text-4xl text-game-green-700">{totalScore}</p>
            </div>
          </div>

          {/* Final indicators */}
          <div className="space-y-3">
            <IndicatorCard
              icon="📈"
              label={t('prod_total')}
              value={indicators.production}
              color="green"
            />
            <IndicatorCard
              icon="♻️"
              label={t('sustentabilidade')}
              value={indicators.sustainability}
              color="blue"
            />
            <IndicatorCard
              icon="💧"
              label={t('agua')}
              value={indicators.water}
              color="brown"
            />
          </div>

          {/* Global Ranking Section */}
          <div className="pt-6 border-t-2 border-game-gray-300">
            <GlobalRanking currentProfileId={activeProfile?.id} />
          </div>

          {/* Replay button */}
          <PixelButton variant="primary" onClick={handleReplay} className="w-full" size="lg">
            {t('cta_replay')}
          </PixelButton>
        </div>
      </div>
    </GameLayout>
  );
}
