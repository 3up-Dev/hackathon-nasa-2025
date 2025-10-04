import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PixelButton } from '@/components/layout/PixelButton';
import { useLanguage } from '@/hooks/useLanguage';
import { useGameState } from '@/hooks/useGameState';
import { crops } from '@/data/crops';
import { brazilStates } from '@/data/states';
import { calculateViability } from '@/data/gameLogic';
import { useClimateData } from '@/hooks/useClimateData';
import { useMemo, useState } from 'react';
import { Satellite } from 'lucide-react';

interface ViabilityPopupProps {
  open: boolean;
  onClose: () => void;
  stateId: string;
}

export const ViabilityPopup = ({ open, onClose, stateId }: ViabilityPopupProps) => {
  const { t, lang } = useLanguage();
  const { selectedCrop, addPlanting } = useGameState();
  const [useRealData, setUseRealData] = useState(true);

  const state = brazilStates.find((s) => s.id === stateId);
  const crop = crops.find((c) => c.id === selectedCrop);

  // Fetch real NASA climate data
  const { data: climateData, loading: loadingClimate } = useClimateData(state, open && useRealData);

  const viability = useMemo(() => {
    if (!crop || !state) return null;
    return calculateViability(crop, state, climateData || undefined);
  }, [crop, state, climateData]);

  if (!state || !crop || !viability) return null;

  const handlePlant = () => {
    navigate(`/education?crop=${crop.id}&state=${stateId}`);
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

  const displayTemp = climateData?.temperature ?? state.temp;
  const displayRain = climateData?.precipitation ?? state.rain;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[342px] rounded-2xl border-4 border-game-green-700">
        <DialogHeader>
          <DialogTitle className="font-pixel text-xs flex items-center gap-2">
            <span className="text-3xl">{crop.icon}</span>
            {t('popup_title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <p className="font-sans text-base font-bold text-game-fg">{state.name}</p>
            {viability?.isRealData && !loadingClimate && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-500 bg-opacity-20 rounded-full">
                <Satellite className="w-3 h-3 text-blue-600" />
                <span className="font-sans text-xs text-blue-600 font-semibold">NASA</span>
              </div>
            )}
            {loadingClimate && (
              <span className="font-sans text-xs text-game-gray-700">
                {lang === 'pt' ? 'Carregando...' : 'Loading...'}
              </span>
            )}
          </div>
          
          {/* Data rows */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 bg-game-bg rounded-lg">
              <span className="text-2xl">🌡️</span>
              <div className="flex-1">
                <p className="font-sans text-xs text-game-gray-700">{t('popup_temp')}</p>
                <p className="font-sans text-sm font-semibold text-game-fg">{displayTemp}°C</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 bg-game-bg rounded-lg">
              <span className="text-2xl">☔</span>
              <div className="flex-1">
                <p className="font-sans text-xs text-game-gray-700">{t('popup_rain')}</p>
                <p className="font-sans text-sm font-semibold text-game-fg">{displayRain} mm/ano</p>
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
