/**
 * Este arquivo foi desenvolvido com assistência de Inteligência Artificial.
 * Toda a lógica, estrutura e implementação foram revisadas e validadas pela equipe humana.
 * 
 * This file was developed with Artificial Intelligence assistance.
 * All logic, structure, and implementation were reviewed and validated by the human team.
 */

import { useNavigate } from 'react-router-dom';
import { GameLayout } from '@/components/layout/GameLayout';
import { PixelButton } from '@/components/layout/PixelButton';
import { MedalBadge } from '@/components/game/MedalBadge';
import { IndicatorCard } from '@/components/game/IndicatorCard';
import { useLanguage } from '@/hooks/useLanguage';
import { useGameState } from '@/hooks/useGameState';
import { getMedalType } from '@/data/gameLogic';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function Results() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { indicators, totalScore, plantedStates, resetGame } = useGameState();

  // Removido o redirecionamento automático para permitir visualizar resultados mesmo sem produções

  const medalType = getMedalType(totalScore);

  const handleReplay = () => {
    resetGame();
    navigate('/');
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
          {/* Logout button */}
          <div className="flex justify-start">
            <button
              onClick={handleLogout}
              className="font-sans text-sm text-game-gray-700 hover:text-game-fg"
            >
              ← Sair
            </button>
          </div>

          {/* Header */}
          <div className="text-center">
            <h1 className="font-pixel text-base text-game-fg mb-2">{t('results_title')}</h1>
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

          {/* Replay button */}
          <PixelButton variant="primary" onClick={handleReplay} className="w-full" size="lg">
            {t('cta_replay')}
          </PixelButton>
        </div>
      </div>
    </GameLayout>
  );
}
