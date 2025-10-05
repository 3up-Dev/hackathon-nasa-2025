/**
 * Este arquivo foi desenvolvido com assistência de Inteligência Artificial.
 * Toda a lógica, estrutura e implementação foram revisadas e validadas pela equipe humana.
 * 
 * This file was developed with Artificial Intelligence assistance.
 * All logic, structure, and implementation were reviewed and validated by the human team.
 */

import { useLanguage } from '@/hooks/useLanguage';

interface MedalBadgeProps {
  type: 'gold' | 'silver' | 'bronze';
}

export const MedalBadge = ({ type }: MedalBadgeProps) => {
  const { t } = useLanguage();

  const medals = {
    gold: { emoji: '🥇', color: 'text-game-gold', key: 'medal_gold' as const },
    silver: { emoji: '🥈', color: 'text-game-gray-700', key: 'medal_silver' as const },
    bronze: { emoji: '🥉', color: 'text-game-brown', key: 'medal_bronze' as const },
  };

  const medal = medals[type];

  return (
    <div className="flex flex-col items-center animate-scale-in">
      <div className="text-8xl mb-4 animate-pulse">{medal.emoji}</div>
      <h3 className={`font-pixel text-base ${medal.color}`}>{t(medal.key)}</h3>
    </div>
  );
};
