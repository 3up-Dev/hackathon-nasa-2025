import { useState } from 'react';
import { GameLayout } from '@/components/layout/GameLayout';
import { BrazilMap } from '@/components/game/BrazilMap';
import { CropSelector } from '@/components/game/CropSelector';
import { IndicatorCard } from '@/components/game/IndicatorCard';
import { ViabilityPopup } from '@/components/game/ViabilityPopup';
import { useLanguage } from '@/hooks/useLanguage';
import { useGameState } from '@/hooks/useGameState';
import { useNavigate } from 'react-router-dom';
import { PixelButton } from '@/components/layout/PixelButton';
import { toast } from 'sonner';

export default function GameMap() {
  const [popupState, setPopupState] = useState<string | null>(null);
  const { t } = useLanguage();
  const { indicators, selectedCrop, plantedStates } = useGameState();
  const navigate = useNavigate();

  const handleStateClick = (stateId: string) => {
    if (!selectedCrop) {
      toast.error(t('choose_crop'));
      return;
    }
    setPopupState(stateId);
  };

  const handleFinish = () => {
    if (plantedStates.length === 0) {
      toast.error('Plante pelo menos uma cultura!');
      return;
    }
    navigate('/results');
  };

  return (
    <GameLayout>
      <div className="relative h-full bg-game-bg flex flex-col">
        {/* Header with indicators */}
        <div className="p-4 bg-white border-b-2 border-game-gray-300 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-game-gray-300 hover:bg-game-gray-700 hover:text-white transition-colors"
              aria-label="Voltar"
            >
              ←
            </button>
            <h2 className="font-pixel text-xs text-game-fg">{t('map_title')}</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
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
        </div>

        {/* Map area */}
        <div className="flex-1 overflow-hidden pb-[140px]">
          <BrazilMap onStateClick={handleStateClick} />
        </div>

        {/* Crop selector */}
        <CropSelector />

        {/* Finish button - shown when at least one planting */}
        {plantedStates.length > 0 && (
          <div className="absolute top-[180px] right-4 z-10">
            <PixelButton
              variant="primary"
              onClick={handleFinish}
              className="shadow-lg"
            >
              ✓ {plantedStates.length}
            </PixelButton>
          </div>
        )}

        {/* Viability popup */}
        {popupState && (
          <ViabilityPopup
            open={!!popupState}
            onClose={() => setPopupState(null)}
            stateId={popupState}
          />
        )}
      </div>
    </GameLayout>
  );
}
