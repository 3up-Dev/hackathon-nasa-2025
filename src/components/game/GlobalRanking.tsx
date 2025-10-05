/**
 * Este arquivo foi desenvolvido com assistência de Inteligência Artificial.
 * Toda a lógica, estrutura e implementação foram revisadas e validadas pela equipe humana.
 * 
 * This file was developed with Artificial Intelligence assistance.
 * All logic, structure, and implementation were reviewed and validated by the human team.
 */

import { useGlobalRanking } from '@/hooks/useGlobalRanking';
import { RankingCard } from './RankingCard';
import { useLanguage } from '@/hooks/useLanguage';

interface GlobalRankingProps {
  currentProfileId?: string;
}

export const GlobalRanking = ({ currentProfileId }: GlobalRankingProps) => {
  const { t } = useLanguage();
  const { rankings, currentUserPosition, globalStats, loading, error } = useGlobalRanking(currentProfileId);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="text-center py-8">
          <p className="font-sans text-sm text-game-gray-700">Carregando ranking...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-md border-2 border-game-gray-300">
        <p className="font-sans text-sm text-game-gray-700 text-center">
          Erro ao carregar ranking: {error}
        </p>
      </div>
    );
  }

  if (rankings.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-md border-2 border-game-gray-300">
        <p className="font-sans text-sm text-game-gray-700 text-center">
          Nenhum jogador no ranking ainda.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com estatísticas */}
      <div className="text-center">
        <h2 className="font-pixel text-base text-game-fg mb-2">🏆 {t('ranking_global')}</h2>
        <div className="flex justify-center gap-4">
          <p className="font-sans text-xs text-game-gray-700">
            {t('total_players')}: <span className="font-semibold">{globalStats.totalPlayers}</span>
          </p>
          <p className="font-sans text-xs text-game-gray-700">
            {t('average_score')}: <span className="font-semibold">{globalStats.averageScore} pts</span>
          </p>
        </div>
        {currentUserPosition && (
          <p className="font-sans text-xs text-game-green-700 mt-1">
            {t('your_position')}: <span className="font-semibold">#{currentUserPosition}</span>
          </p>
        )}
      </div>

      {/* Lista de Rankings */}
      <div className="space-y-2">
        {rankings.map((entry) => (
          <RankingCard
            key={entry.id}
            position={entry.ranking_position}
            profileName={entry.username ?? entry.profile_name}
            cropId={entry.crop_id}
            sector={entry.sector}
            stateId={entry.state_id}
            totalScore={entry.total_score}
            medal={entry.medal}
            isCurrentUser={entry.id === currentProfileId}
          />
        ))}
      </div>

      {/* Footer com informação de que mostra top 50 */}
      {rankings.length >= 50 && (
        <p className="font-sans text-xs text-game-gray-700 text-center italic">
          Mostrando top 50 jogadores
        </p>
      )}
    </div>
  );
};
