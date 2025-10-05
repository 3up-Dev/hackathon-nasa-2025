/**
 * Este arquivo foi desenvolvido com assistência de Inteligência Artificial.
 * Toda a lógica, estrutura e implementação foram revisadas e validadas pela equipe humana.
 * 
 * This file was developed with Artificial Intelligence assistance.
 * All logic, structure, and implementation were reviewed and validated by the human team.
 */

import { cn } from '@/lib/utils';

interface RankingCardProps {
  position: number;
  profileName: string;
  cropId: string;
  sector: string;
  stateId: string;
  totalScore: number;
  medal: 'gold' | 'silver' | 'bronze';
  isCurrentUser?: boolean;
}

export const RankingCard = ({
  position,
  profileName,
  stateId,
  totalScore,
  medal,
  isCurrentUser = false,
}: RankingCardProps) => {
  const medalEmojis = {
    gold: '🥇',
    silver: '🥈',
    bronze: '🥉',
  };

  const positionColors = {
    1: 'text-game-gold',
    2: 'text-game-gray-700',
    3: 'text-game-brown',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-lg p-3 shadow-md transition-all duration-200',
        isCurrentUser
          ? 'border-2 border-game-green-700 bg-game-green-100'
          : 'border-2 border-game-gray-300'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Position */}
          <div className="flex-shrink-0 w-8 text-center">
            <span
              className={cn(
                'font-pixel text-sm',
                position <= 3 ? positionColors[position as 1 | 2 | 3] : 'text-game-fg'
              )}
            >
              #{position}
            </span>
          </div>

          {/* Medal */}
          <div className="flex-shrink-0 text-2xl">
            {position <= 3 ? medalEmojis[medal] : '🏅'}
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <p className="font-sans text-sm font-semibold text-game-fg truncate">
              {isCurrentUser ? 'VOCÊ' : profileName}
            </p>
          </div>

          {/* Score */}
          <div className="flex-shrink-0 text-right">
            <p className="font-pixel text-base text-game-green-700">{totalScore}</p>
            <p className="font-sans text-[10px] text-game-gray-700">pts</p>
          </div>
        </div>
      </div>
    </div>
  );
};
