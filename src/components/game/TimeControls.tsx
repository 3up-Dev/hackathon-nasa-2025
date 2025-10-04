import * as React from 'react';
import { PixelButton } from '@/components/layout/PixelButton';
import { Calendar, ChevronRight, Zap } from 'lucide-react';

interface TimeControlsProps {
  currentDay: number;
  totalDays: number;
  onAdvanceTime: (days: number) => void;
  lang: 'pt' | 'en';
  isReadyToHarvest: boolean;
}

export const TimeControls = ({
  currentDay,
  totalDays,
  onAdvanceTime,
  lang,
  isReadyToHarvest,
}: TimeControlsProps) => {
  if (isReadyToHarvest) return null;

  const timeOptions = [
    { days: 1, label: lang === 'pt' ? '1 dia' : '1 day', icon: Calendar },
    { days: 7, label: lang === 'pt' ? '1 semana' : '1 week', icon: ChevronRight },
    { days: 30, label: lang === 'pt' ? '1 mês' : '1 month', icon: Zap },
  ];

  const daysRemaining = totalDays - currentDay;
  const canAdvance30 = daysRemaining >= 30;
  const canAdvance7 = daysRemaining >= 7;
  const canAdvance1 = daysRemaining >= 1;

  return (
    <div className="bg-game-bg border-4 border-game-fg rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-game-fg" />
        <h3 className="font-pixel text-base text-game-fg">
          {lang === 'pt' ? 'Avançar Tempo' : 'Advance Time'}
        </h3>
      </div>

      {/* Progress indicator */}
      <div className="mb-4 p-3 bg-game-green-400/20 border-2 border-game-green-700 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="font-pixel text-xs text-game-fg">
            {lang === 'pt' ? 'Dias restantes' : 'Days remaining'}
          </span>
          <span className="font-pixel text-sm text-game-green-700">
            {daysRemaining}
          </span>
        </div>
        <div className="w-full bg-game-gray-300 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-game-green-700 transition-all duration-500"
            style={{ width: `${(currentDay / totalDays) * 100}%` }}
          />
        </div>
      </div>

      {/* Time buttons */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {timeOptions.map((option) => {
          const isDisabled =
            (option.days === 30 && !canAdvance30) ||
            (option.days === 7 && !canAdvance7) ||
            (option.days === 1 && !canAdvance1);

          const Icon = option.icon;

          return (
            <button
              key={option.days}
              onClick={() => !isDisabled && onAdvanceTime(option.days)}
              disabled={isDisabled}
              className={`relative group border-4 rounded-lg p-3 transition-all ${
                isDisabled
                  ? 'bg-game-gray-200 border-game-gray-400 opacity-50 cursor-not-allowed'
                  : 'bg-game-bg border-game-fg hover:border-game-green-700 hover:bg-game-green-400/10 active:scale-95 cursor-pointer'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <Icon
                  className={`w-6 h-6 ${
                    isDisabled ? 'text-game-gray-500' : 'text-game-green-700'
                  }`}
                />
                <span
                  className={`font-pixel text-xs ${
                    isDisabled ? 'text-game-gray-500' : 'text-game-fg'
                  }`}
                >
                  +{option.days}
                </span>
                <span
                  className={`font-sans text-xs ${
                    isDisabled ? 'text-game-gray-500' : 'text-game-gray-700'
                  }`}
                >
                  {option.label.split(' ')[1]}
                </span>
              </div>

              {!isDisabled && (
                <div className="absolute inset-0 rounded-lg bg-game-green-700 opacity-0 group-hover:opacity-10 transition-opacity" />
              )}
            </button>
          );
        })}
      </div>

      {/* Warning */}
      <div className="p-3 bg-game-brown/20 border-2 border-game-brown rounded-lg">
        <p className="font-sans text-xs text-game-gray-700 text-center">
          ⚠️{' '}
          {lang === 'pt'
            ? 'Complete as tarefas antes de avançar o tempo para manter a saúde da produção'
            : 'Complete tasks before advancing time to maintain production health'}
        </p>
      </div>
    </div>
  );
};
