/**
 * Este arquivo foi desenvolvido com assistência de Inteligência Artificial.
 * Toda a lógica, estrutura e implementação foram revisadas e validadas pela equipe humana.
 * 
 * This file was developed with Artificial Intelligence assistance.
 * All logic, structure, and implementation were reviewed and validated by the human team.
 */

import { getMedalType } from '@/data/gameLogic';
import { Trophy, Target, TrendingUp } from 'lucide-react';

interface UserStatsCardProps {
  totalScore: number;
  profilesCount: number;
  bestScore: number;
}

export const UserStatsCard = ({ totalScore, profilesCount, bestScore }: UserStatsCardProps) => {
  const medal = getMedalType(bestScore);
  
  const medalEmojis = {
    gold: '🥇',
    silver: '🥈',
    bronze: '🥉',
  };

  const medalColors = {
    gold: 'text-game-gold',
    silver: 'text-game-gray-700',
    bronze: 'text-game-brown',
  };

  return (
    <div className="bg-gradient-to-br from-game-green-100 to-game-green-200 rounded-xl p-4 shadow-lg border-2 border-game-green-700 mb-6">
      <div className="flex items-center justify-between">
        {/* Medalha e Melhor Score */}
        <div className="flex items-center gap-3">
          <div className="text-5xl animate-pulse">
            {medalEmojis[medal]}
          </div>
          <div>
            <p className="font-sans text-xs text-game-gray-700 mb-1">Melhor Resultado</p>
            <p className={`font-pixel text-2xl ${medalColors[medal]}`}>
              {bestScore} pts
            </p>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-game-green-700" />
            <span className="font-sans text-xs text-game-fg">
              <span className="font-semibold">{totalScore}</span> pts total
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-game-green-700" />
            <span className="font-sans text-xs text-game-fg">
              <span className="font-semibold">{profilesCount}</span> {profilesCount === 1 ? 'perfil' : 'perfis'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-game-green-700" />
            <span className="font-sans text-xs text-game-fg">
              Média: <span className="font-semibold">{Math.round(totalScore / profilesCount)}</span> pts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
