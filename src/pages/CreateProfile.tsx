import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { GameLayout } from '@/components/layout/GameLayout';
import { PixelButton } from '@/components/layout/PixelButton';
import { BrazilMap } from '@/components/game/BrazilMap';
import { useGameProfiles } from '@/hooks/useGameProfiles';
import { useLanguage } from '@/hooks/useLanguage';
import { crops } from '@/data/crops';
import { states } from '@/data/states';
import { cn } from '@/lib/utils';

const sectors = [
  { id: 'agricultura', icon: '🌾', name: { pt: 'Agricultura', en: 'Agriculture' } },
  { id: 'pecuaria', icon: '🐄', name: { pt: 'Pecuária', en: 'Livestock' } },
  { id: 'aquicultura', icon: '🐟', name: { pt: 'Aquicultura', en: 'Aquaculture' } },
  { id: 'silvicultura', icon: '🌲', name: { pt: 'Silvicultura', en: 'Forestry' } },
  { id: 'horticultura', icon: '🥬', name: { pt: 'Horticultura', en: 'Horticulture' } },
];

export default function CreateProfile() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { createProfile } = useGameProfiles();
  
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const handleBack = () => {
    navigate('/profiles');
  };

  const filteredCrops = selectedSector 
    ? crops.filter(crop => crop.sector === selectedSector)
    : [];

  const handleCreateProfile = async () => {
    if (!selectedSector || !selectedCrop || !selectedState) return;
    
    // Gerar nome automaticamente no formato BR/ESTADO/CULTURA
    const cropData = crops.find(c => c.id === selectedCrop);
    const cropName = cropData?.name[lang] || selectedCrop;
    const generatedName = `BR/${selectedState}/${cropName}`;
    
    setCreating(true);
    const profileId = await createProfile({
      profile_name: generatedName,
      sector: selectedSector,
      crop_id: selectedCrop,
      state_id: selectedState,
    });

    if (profileId) {
      navigate('/game');
    }
    setCreating(false);
  };

  const canCreate = selectedSector && selectedCrop && selectedState;
  const selectedStateData = states.find(s => s.id === selectedState);

  return (
    <GameLayout>
      <div className="h-full flex flex-col bg-game-bg">
        {/* Header */}
        <div className="p-4 border-b-4 border-game-fg bg-white flex items-center gap-4">
          <button
            onClick={handleBack}
            className="text-game-fg hover:text-game-green-400 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-pixel text-sm text-game-fg">
            Criar Novo Perfil
          </h1>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Setor Selection */}
          <div>
            <h2 className="font-pixel text-xs text-game-fg mb-3 text-center">
              1. Escolha o Setor
            </h2>
            <div className="grid grid-cols-5 gap-1 max-w-2xl mx-auto">
              {sectors.map((sector) => (
                <button
                  key={sector.id}
                  onClick={() => {
                    setSelectedSector(sector.id);
                    setSelectedCrop(null); // Reset crop when changing sector
                  }}
                  className={cn(
                    'flex flex-col items-center justify-center p-2 rounded-lg border-4 transition-all',
                    selectedSector === sector.id
                      ? 'border-game-green-700 bg-game-green-400 bg-opacity-20 scale-105 shadow-lg'
                      : 'border-game-gray-300 hover:border-game-green-400 hover:scale-105 bg-white'
                  )}
                >
                  <span className="text-xl mb-1">{sector.icon}</span>
                  <span className="font-pixel text-[6px] text-game-fg text-center leading-tight">
                    {sector.name[lang]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Map */}
          <div>
            <h2 className="font-pixel text-xs text-game-fg mb-3 text-center">
              2. Escolha o Estado
              {selectedState && (
                <span className="text-game-green-700 ml-2">
                  ({selectedStateData?.name})
                </span>
              )}
            </h2>
            <div className="bg-white rounded-xl border-4 border-game-fg p-2" style={{ height: '400px' }}>
              <BrazilMap onStateClick={setSelectedState} />
            </div>
          </div>

          {/* Crop Selection */}
          {selectedSector && (
            <div>
              <h2 className="font-pixel text-xs text-game-fg mb-3 text-center">
                3. Escolha a Cultura/Animal
              </h2>
              <div className="bg-white rounded-xl border-4 border-game-fg p-4">
                <div className="grid grid-cols-4 gap-2 max-w-2xl mx-auto">
                  {filteredCrops.map((crop) => (
                    <button
                      key={crop.id}
                      onClick={() => setSelectedCrop(crop.id)}
                      className={cn(
                        'flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all',
                        selectedCrop === crop.id
                          ? 'border-game-green-700 bg-game-green-400 bg-opacity-20 scale-105 shadow-lg'
                          : 'border-game-gray-300 hover:border-game-green-400 hover:scale-105'
                      )}
                    >
                      <span className="text-2xl mb-1">{crop.icon}</span>
                      <span className="font-sans text-[9px] text-game-fg text-center leading-tight font-medium">
                        {crop.name[lang]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="p-4 border-t-4 border-game-fg bg-white">
          <PixelButton
            onClick={handleCreateProfile}
            disabled={!canCreate || creating}
            className="w-full"
          >
            {creating ? 'Criando...' : '🚀 Iniciar Produção'}
          </PixelButton>
          {canCreate && (
            <p className="text-center text-xs text-game-gray-700 mt-2 font-sans">
              Nome do perfil: BR/{selectedState}/{crops.find(c => c.id === selectedCrop)?.name[lang]}
            </p>
          )}
        </div>
      </div>
    </GameLayout>
  );
}
