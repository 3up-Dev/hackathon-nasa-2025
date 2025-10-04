import * as React from 'react';
import { Crop, CropStage } from '@/data/crops';
import { Check, Circle } from 'lucide-react';

interface StageProgressProps {
  crop: Crop;
  currentDay: number;
  lang: 'pt' | 'en';
}

export const StageProgress = ({ crop, currentDay, lang }: StageProgressProps) => {
  const getCurrentStageIndex = (): number => {
    let accumulatedDays = 0;
    for (let i = 0; i < crop.stages.length; i++) {
      accumulatedDays += crop.stages[i].daysToComplete;
      if (currentDay < accumulatedDays) {
        return i;
      }
    }
    return crop.stages.length - 1;
  };

  const currentStageIndex = getCurrentStageIndex();

  return (
    <div className="bg-game-bg border-4 border-game-fg rounded-xl p-6">
      <h3 className="font-pixel text-base text-game-fg mb-6">
        {lang === 'pt' ? 'Etapas de Crescimento' : 'Growth Stages'}
      </h3>

      <div className="space-y-4">
        {crop.stages.map((stage, index) => {
          const isComplete = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;
          const isPending = index > currentStageIndex;

          let accumulatedDays = 0;
          for (let i = 0; i < index; i++) {
            accumulatedDays += crop.stages[i].daysToComplete;
          }

          const progress = isCurrent
            ? Math.min(
                100,
                ((currentDay - accumulatedDays) / stage.daysToComplete) * 100
              )
            : isComplete
            ? 100
            : 0;

          return (
            <div key={index} className="relative">
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all ${
                    isComplete
                      ? 'bg-game-green-700 border-game-green-700'
                      : isCurrent
                      ? 'bg-game-green-400 border-game-green-700 animate-pulse'
                      : 'bg-game-gray-200 border-game-gray-400'
                  }`}
                >
                  {isComplete ? (
                    <Check className="w-6 h-6 text-white" />
                  ) : (
                    <Circle
                      className={`w-6 h-6 ${
                        isCurrent ? 'text-white' : 'text-game-gray-500'
                      }`}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4
                      className={`font-pixel text-sm ${
                        isCurrent
                          ? 'text-game-fg'
                          : isComplete
                          ? 'text-game-green-700'
                          : 'text-game-gray-600'
                      }`}
                    >
                      {stage.name[lang]}
                    </h4>
                    <span className="font-sans text-xs text-game-gray-600">
                      {stage.daysToComplete} {lang === 'pt' ? 'dias' : 'days'}
                    </span>
                  </div>

                  {/* Progress bar */}
                  {(isCurrent || isComplete) && (
                    <div className="w-full bg-game-gray-300 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isComplete ? 'bg-game-green-700' : 'bg-game-green-400'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}

                  {/* Stage details */}
                  {isCurrent && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="bg-game-green-400/20 border border-game-green-700 rounded px-2 py-1">
                        <p className="font-sans text-xs text-game-gray-700">
                          💧{' '}
                          {lang === 'pt'
                            ? stage.waterNeeds === 'high'
                              ? 'Água: Alta'
                              : stage.waterNeeds === 'medium'
                              ? 'Água: Média'
                              : 'Água: Baixa'
                            : `Water: ${stage.waterNeeds}`}
                        </p>
                      </div>
                      <div className="bg-game-green-400/20 border border-game-green-700 rounded px-2 py-1">
                        <p className="font-sans text-xs text-game-gray-700">
                          🌡️{' '}
                          {lang === 'pt'
                            ? stage.tempSensitivity === 'high'
                              ? 'Sensível'
                              : 'Normal'
                            : stage.tempSensitivity === 'high'
                            ? 'Sensitive'
                            : 'Normal'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Connector line */}
              {index < crop.stages.length - 1 && (
                <div
                  className={`absolute left-6 top-12 w-0.5 h-8 -mb-8 ${
                    index < currentStageIndex
                      ? 'bg-game-green-700'
                      : 'bg-game-gray-300'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 p-3 bg-game-green-400/20 border-2 border-game-green-700 rounded-lg">
        <p className="font-sans text-xs text-game-gray-700 text-center">
          {lang === 'pt'
            ? `Progresso total: ${Math.round((currentDay / crop.growthDays) * 100)}%`
            : `Total progress: ${Math.round((currentDay / crop.growthDays) * 100)}%`}
        </p>
      </div>
    </div>
  );
};
