import { useGameState } from '@/hooks/useGameState';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

const sectors = [
  { id: 'agricultura', icon: '🌾', name: { pt: 'Agricultura', en: 'Agriculture' }, color: '#66BB6A' },
  { id: 'pecuaria', icon: '🐄', name: { pt: 'Pecuária', en: 'Livestock' }, color: '#8D6E63' },
  { id: 'aquicultura', icon: '🐟', name: { pt: 'Aquicultura', en: 'Aquaculture' }, color: '#42A5F5' },
  { id: 'silvicultura', icon: '🌲', name: { pt: 'Silvicultura', en: 'Forestry' }, color: '#558B2F' },
  { id: 'horticultura', icon: '🥬', name: { pt: 'Horticultura', en: 'Horticulture' }, color: '#66BB6A' },
];

export const SectorSelector = () => {
  const { selectedSector, setSelectedSector } = useGameState();
  const { lang } = useLanguage();

  return (
    <div className="absolute top-20 left-0 right-0 bg-white border-b-4 border-game-green-700 shadow-lg z-10">
      <div className="p-4">
        <h3 className="font-pixel text-xs text-game-fg mb-3">Escolha o Setor</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sectors.map((sector) => (
            <button
              key={sector.id}
              onClick={() => setSelectedSector(sector.id)}
              className={cn(
                'flex flex-col items-center justify-center min-w-[90px] h-24 rounded-lg border-2 transition-all',
                'focus:outline-none focus:ring-2 focus:ring-game-green-400',
                selectedSector === sector.id
                  ? 'border-game-green-700 bg-game-green-400 bg-opacity-20 scale-105 shadow-lg'
                  : 'border-game-gray-300 hover:border-game-green-400 hover:scale-105'
              )}
            >
              <span className="text-3xl mb-1">{sector.icon}</span>
              <span className="font-sans text-xs text-game-fg font-medium text-center px-1">
                {sector.name[lang]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
