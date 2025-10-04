import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PixelButton } from '@/components/layout/PixelButton';
import { useLanguage } from '@/hooks/useLanguage';
import { useGameState } from '@/hooks/useGameState';
import { crops } from '@/data/crops';
import { brazilStates } from '@/data/states';
import { calculateViability } from '@/data/gameLogic';
import { useMemo } from 'react';

interface ViabilityPopupProps {
  open: boolean;
  onClose: () => void;
  stateId: string;
}

export const ViabilityPopup = ({ open, onClose, stateId }: ViabilityPopupProps) => {
  const { t, lang } = useLanguage();
  const { selectedCrop, addPlanting } = useGameState();

  const state = brazilStates.find((s) => s.id === stateId);
  const crop = crops.find((c) => c.id === selectedCrop);

  const viability = useMemo(() => {
    if (!crop || !state) return null;
    return calculateViability(crop, state);
  }, [crop, state]);

  if (!state || !crop || !viability) return null;

  const handlePlant = () => {
    addPlanting(stateId, viability.scores);
    onClose();
  };

  const suggestedStates = brazilStates
    .filter((s) => {
      const v = calculateViability(crop, s);
      return v.isViable && s.id !== stateId;
    })
    .slice(0, 3)
    .map((s) => s.name)
    .join(', ');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[342px] rounded-2xl border-4 border-game-green-700">
        <DialogHeader>
          <DialogTitle className="font-pixel text-sm flex items-center gap-2">
            <span className="text-3xl">{crop.icon}</span>
            {t('popup_title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Data rows */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 bg-game-bg rounded-lg">
              <span className="text-2xl">🌡️</span>
              <div className="flex-1">
                <p className="font-sans text-xs text-game-gray-700">{t('popup_temp')}</p>
                <p className="font-sans text-sm font-semibold text-game-fg">{state.temp}°C</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 bg-game-bg rounded-lg">
              <span className="text-2xl">☔</span>
              <div className="flex-1">
                <p className="font-sans text-xs text-game-gray-700">{t('popup_rain')}</p>
                <p className="font-sans text-sm font-semibold text-game-fg">{state.rain} mm/ano</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 bg-game-bg rounded-lg">
              <span className="text-2xl">🏔️</span>
              <div className="flex-1">
                <p className="font-sans text-xs text-game-gray-700">{t('popup_soil')}</p>
                <p className="font-sans text-sm font-semibold text-game-fg capitalize">{state.soil}</p>
              </div>
            </div>
          </div>

          {/* Result message */}
          <div
            className={`p-4 rounded-lg ${
              viability.isViable ? 'bg-game-green-400 bg-opacity-20' : 'bg-game-red bg-opacity-20'
            }`}
          >
            <p className="font-sans text-sm font-semibold text-game-fg mb-2">
              {t(viability.isViable ? 'popup_viavel' : 'popup_inviavel', { crop: crop.name[lang] })}
            </p>
            {!viability.isViable && viability.reasons.length > 0 && (
              <>
                <p className="font-sans text-xs text-game-gray-700 mb-2">
                  {viability.reasons.map((reason) => t(reason as any)).join(' ')}
                </p>
                {suggestedStates && (
                  <p className="font-sans text-xs text-game-gray-700 italic">
                    {t('tip_try_states', { states: suggestedStates })}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <PixelButton variant="primary" onClick={handlePlant} className="flex-1">
              {t('cta_plant')}
            </PixelButton>
            <PixelButton variant="ghost" onClick={onClose} className="flex-1">
              {t('cta_close')}
            </PixelButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
