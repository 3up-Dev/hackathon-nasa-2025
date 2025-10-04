import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ThermometerSun, Cloud, Mountain, CheckCircle, XCircle } from 'lucide-react';
import { GameLayout } from '@/components/layout/GameLayout';
import { PixelButton } from '@/components/layout/PixelButton';
import { BrazilMap } from '@/components/game/BrazilMap';
import { useGameProfiles } from '@/hooks/useGameProfiles';
import { useLanguage } from '@/hooks/useLanguage';
import { useClimateData } from '@/hooks/useClimateData';
import { crops } from '@/data/crops';
import { states } from '@/data/states';
import { calculateViability } from '@/data/gameLogic';
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
  const selectedCropData = crops.find(c => c.id === selectedCrop);

  // Fetch climate data when all selections are made
  const { data: climateData, loading: climateLoading } = useClimateData(
    selectedStateData || null,
    !!canCreate
  );

  // Calculate viability when we have all data
  const [viabilityResult, setViabilityResult] = useState<any>(null);
  
  useEffect(() => {
    if (selectedCropData && selectedStateData && canCreate) {
      const result = calculateViability(
        selectedCropData,
        selectedStateData,
        climateData ? {
          temperature: climateData.temperature,
          precipitation: climateData.precipitation,
          isRealData: climateData.isRealData
        } : undefined
      );
      setViabilityResult(result);
    } else {
      setViabilityResult(null);
    }
  }, [selectedCropData, selectedStateData, climateData, canCreate]);

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
                  <span className="font-pixel text-[5px] text-game-fg text-center leading-tight">
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

          {/* Viability Report */}
          {canCreate && viabilityResult && (
            <div className={cn(
              "rounded-xl border-4 p-4 space-y-3",
              viabilityResult.isViable 
                ? "border-game-green-700 bg-game-green-400 bg-opacity-10" 
                : "border-game-brown bg-game-brown bg-opacity-10"
            )}>
              {/* Header */}
              <div className="flex items-center gap-2">
                {viabilityResult.isViable ? (
                  <CheckCircle className="w-5 h-5 text-game-green-700" />
                ) : (
                  <XCircle className="w-5 h-5 text-game-brown" />
                )}
                <h3 className="font-pixel text-xs text-game-fg">
                  {viabilityResult.isViable ? '✅ Local Viável' : '⚠️ Local Desafiador'}
                </h3>
              </div>

              {/* Climate Data */}
              {climateLoading ? (
                <div className="text-center py-2">
                  <span className="font-sans text-xs text-game-gray-700">Carregando dados climáticos...</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center p-2 bg-white rounded-lg border-2 border-game-gray-300">
                    <ThermometerSun className="w-4 h-4 text-game-brown mb-1" />
                    <span className="font-sans text-[10px] text-game-gray-700">Temperatura</span>
                    <span className="font-pixel text-xs text-game-fg">
                      {climateData?.temperature || selectedStateData?.temp}°C
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-center p-2 bg-white rounded-lg border-2 border-game-gray-300">
                    <Cloud className="w-4 h-4 text-blue-500 mb-1" />
                    <span className="font-sans text-[10px] text-game-gray-700">Chuva Anual</span>
                    <span className="font-pixel text-xs text-game-fg">
                      {climateData?.precipitation || selectedStateData?.rain}mm
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-center p-2 bg-white rounded-lg border-2 border-game-gray-300">
                    <Mountain className="w-4 h-4 text-amber-700 mb-1" />
                    <span className="font-sans text-[10px] text-game-gray-700">Tipo de Solo</span>
                    <span className="font-pixel text-[9px] text-game-fg uppercase">
                      {selectedStateData?.soil}
                    </span>
                  </div>
                </div>
              )}

              {/* Success Rate */}
              <div className="bg-white rounded-lg p-3 border-2 border-game-gray-300">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-sans text-xs text-game-gray-700">Chance de Sucesso</span>
                  <span className="font-pixel text-sm text-game-fg">
                    {viabilityResult.isViable ? '85%' : '45%'}
                  </span>
                </div>
                <div className="w-full bg-game-gray-200 rounded-full h-2">
                  <div 
                    className={cn(
                      "h-2 rounded-full transition-all",
                      viabilityResult.isViable ? "bg-game-green-700" : "bg-game-brown"
                    )}
                    style={{ width: viabilityResult.isViable ? '85%' : '45%' }}
                  />
                </div>
              </div>

              {/* Data Source */}
              {climateData && (
                <p className="text-center text-[8px] text-game-gray-700 font-sans">
                  {climateData.isRealData ? '📡 Dados reais da NASA POWER' : '🔮 Dados simulados'}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="p-4 border-t-4 border-game-fg bg-white space-y-4">

          {/* Create Button */}
          <PixelButton
            onClick={handleCreateProfile}
            disabled={!canCreate || creating}
            className="w-full"
          >
            {creating ? 'Criando...' : '🚀 Iniciar Produção'}
          </PixelButton>
          
          {canCreate && (
            <p className="text-center text-xs text-game-gray-700 font-sans">
              Nome do perfil: BR/{selectedState}/{crops.find(c => c.id === selectedCrop)?.name[lang]}
            </p>
          )}
        </div>
      </div>
    </GameLayout>
  );
}
