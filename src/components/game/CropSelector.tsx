import { crops } from '@/data/crops';
import { useGameState } from '@/hooks/useGameState';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

export const CropSelector = () => {
  const { selectedSector, selectedCrop, setSelectedCrop } = useGameState();
  const { lang, t } = useLanguage();

  const filteredCrops = selectedSector 
    ? crops.filter(crop => crop.sector === selectedSector)
    : [];

  if (!selectedSector) {
    return null;
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t-4 border-game-green-700 shadow-2xl">
      <div className="p-3">
        <h3 className="font-pixel text-xs text-game-fg mb-2">{t('choose_crop')}</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filteredCrops.map((crop) => (
            <button
              key={crop.id}
              onClick={() => setSelectedCrop(crop.id)}
              className={cn(
                'flex flex-col items-center justify-center min-w-[60px] h-16 rounded-lg border-2 transition-all',
                'focus:outline-none focus:ring-2 focus:ring-game-green-400',
                selectedCrop === crop.id
                  ? 'border-game-green-700 bg-game-green-400 bg-opacity-20 scale-105 shadow-lg'
                  : 'border-game-gray-300 hover:border-game-green-400 hover:scale-105'
              )}
            >
              <span className="text-xl mb-1">{crop.icon}</span>
              <span className="font-sans text-[10px] text-game-fg font-medium leading-tight">
                {crop.name[lang]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
