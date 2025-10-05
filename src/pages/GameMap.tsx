/**
 * Este arquivo foi desenvolvido com assistência de Inteligência Artificial.
 * Toda a lógica, estrutura e implementação foram revisadas e validadas pela equipe humana.
 * 
 * This file was developed with Artificial Intelligence assistance.
 * All logic, structure, and implementation were reviewed and validated by the human team.
 */

import { useState } from 'react';
import { GameLayout } from '@/components/layout/GameLayout';
import { BrazilMap } from '@/components/game/BrazilMap';
import { SectorSelector } from '@/components/game/SectorSelector';
import { CropSelector } from '@/components/game/CropSelector';
import { ViabilityPopup } from '@/components/game/ViabilityPopup';
import { useLanguage } from '@/hooks/useLanguage';
import { useGameState } from '@/hooks/useGameState';
import { useNavigate } from 'react-router-dom';
import { PixelButton } from '@/components/layout/PixelButton';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function GameMap() {
  const [popupState, setPopupState] = useState<string | null>(null);
  const { t, lang, toggleLanguage } = useLanguage();
  const { indicators, selectedSector, selectedCrop, plantedStates } = useGameState();
  const navigate = useNavigate();

  const handleStateClick = (stateId: string) => {
    if (!selectedSector) {
      toast.error('Escolha um setor primeiro!');
      return;
    }
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <GameLayout>
      <div className="relative h-full bg-game-bg flex flex-col">
        {/* Header with indicators */}
        <div className="pt-safe p-4 bg-white border-b-2 border-game-gray-300 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-game-gray-300 hover:bg-game-gray-700 hover:text-white transition-colors"
                aria-label="Sair"
              >
                ←
              </button>
              <h2 className="font-pixel text-xs text-game-fg">{t('map_title')}</h2>
            </div>
            
            <button
              onClick={toggleLanguage}
              className="text-2xl hover:scale-110 transition-transform"
              aria-label="Toggle language"
            >
              {lang === 'pt' ? '🇧🇷' : '🇺🇸'}
            </button>
          </div>
        </div>

        {/* Map area */}
        <div className="flex-1 overflow-hidden pb-[100px] pt-[100px]">
          <BrazilMap onStateClick={handleStateClick} />
        </div>

        {/* Sector selector */}
        <SectorSelector />

        {/* Crop selector */}
        <CropSelector />

        {/* Finish button - shown when at least one planting */}
        {plantedStates.length > 0 && (
          <div className="absolute top-[120px] right-4 z-10">
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
