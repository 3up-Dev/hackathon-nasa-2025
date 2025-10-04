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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CreateProfile() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { createProfile } = useGameProfiles();
  
  const [step, setStep] = useState(1);
  const [profileName, setProfileName] = useState('');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/profiles');
    }
  };

  const handleNext = () => {
    if (step === 1 && profileName.trim()) {
      setStep(2);
    } else if (step === 2 && selectedSector) {
      setStep(3);
    } else if (step === 3 && selectedCrop) {
      setStep(4);
    }
  };

  const handleCreateProfile = async () => {
    if (!profileName || !selectedSector || !selectedCrop || !selectedState) return;
    
    setCreating(true);
    const profileId = await createProfile({
      profile_name: profileName.trim(),
      sector: selectedSector,
      crop_id: selectedCrop,
      state_id: selectedState,
    });

    if (profileId) {
      navigate('/game');
    }
    setCreating(false);
  };

  const canProceed = () => {
    if (step === 1) return profileName.trim().length > 0;
    if (step === 2) return selectedSector !== null;
    if (step === 3) return selectedCrop !== null;
    if (step === 4) return selectedState !== null;
    return false;
  };

  const selectedCropData = crops.find(c => c.id === selectedCrop);
  const selectedStateData = states.find(s => s.id === selectedState);

  return (
    <GameLayout>
      <div className="h-full flex flex-col">
        <div className="p-4 border-b-4 border-game-fg bg-white">
          <div className="flex items-center gap-4 mb-4">
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
          
          {/* Progress indicator */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded ${
                  s <= step ? 'bg-game-green-400' : 'bg-game-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {step === 1 && (
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">✍️</div>
                <h2 className="font-pixel text-base text-game-fg mb-2">
                  Nome do Perfil
                </h2>
                <p className="font-sans text-sm text-game-gray-700">
                  Escolha um nome para identificar este perfil
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="profile-name" className="font-pixel text-xs">
                    Nome do Perfil
                  </Label>
                  <Input
                    id="profile-name"
                    type="text"
                    placeholder="Ex: Minha Fazenda de Café"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="mt-1 font-sans"
                    maxLength={50}
                  />
                  <p className="text-xs text-game-gray-700 mt-1">
                    {profileName.length}/50 caracteres
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🌾</div>
                <h2 className="font-pixel text-base text-game-fg mb-2">
                  Escolha o Setor
                </h2>
                <p className="font-sans text-sm text-game-gray-700">
                  Qual setor de produção você quer gerenciar?
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'agricultura', icon: '🌾', name: 'Agricultura' },
                  { id: 'pecuaria', icon: '🐄', name: 'Pecuária' },
                  { id: 'aquicultura', icon: '🐟', name: 'Aquicultura' },
                  { id: 'silvicultura', icon: '🌲', name: 'Silvicultura' },
                  { id: 'horticultura', icon: '🥬', name: 'Horticultura' },
                ].map((sector) => (
                  <button
                    key={sector.id}
                    onClick={() => setSelectedSector(sector.id)}
                    className={`
                      flex flex-col items-center justify-center p-6 rounded-xl border-4 transition-all
                      ${selectedSector === sector.id
                        ? 'border-game-green-700 bg-game-green-400 bg-opacity-20 scale-105 shadow-lg'
                        : 'border-game-gray-300 hover:border-game-green-400 hover:scale-105 bg-white'
                      }
                    `}
                  >
                    <span className="text-4xl mb-2">{sector.icon}</span>
                    <span className="font-pixel text-xs text-game-fg text-center leading-tight">
                      {sector.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">
                  {selectedSector === 'pecuaria' ? '🐄' : '🌱'}
                </div>
                <h2 className="font-pixel text-base text-game-fg mb-2">
                  Escolha a Cultura/Animal
                </h2>
                <p className="font-sans text-sm text-game-gray-700">
                  O que você vai produzir neste perfil?
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {crops
                  .filter(crop => crop.sector === selectedSector)
                  .map((crop) => (
                    <button
                      key={crop.id}
                      onClick={() => setSelectedCrop(crop.id)}
                      className={`
                        flex flex-col items-center justify-center p-4 rounded-xl border-4 transition-all
                        ${selectedCrop === crop.id
                          ? 'border-game-green-700 bg-game-green-400 bg-opacity-20 scale-105 shadow-lg'
                          : 'border-game-gray-300 hover:border-game-green-400 hover:scale-105 bg-white'
                        }
                      `}
                    >
                      <span className="text-3xl mb-2">{crop.icon}</span>
                      <span className="font-sans text-[10px] text-game-fg text-center leading-tight font-medium">
                        {crop.name[lang]}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">📍</div>
                <h2 className="font-pixel text-base text-game-fg mb-2">
                  Escolha o Estado
                </h2>
                <p className="font-sans text-sm text-game-gray-700">
                  Onde você vai iniciar a produção?
                </p>
                {selectedState && (
                  <p className="font-pixel text-xs text-game-green-700 mt-2">
                    Selecionado: {states.find(s => s.id === selectedState)?.name}
                  </p>
                )}
              </div>
              
              <BrazilMap onStateClick={setSelectedState} />
            </div>
          )}
        </div>

        <div className="p-4 border-t-4 border-game-fg bg-white">
          {step < 4 ? (
            <PixelButton
              onClick={handleNext}
              disabled={!canProceed()}
              className="w-full"
            >
              Próximo
            </PixelButton>
          ) : (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-game-bg rounded-lg p-4 border-2 border-game-fg">
                <h3 className="font-pixel text-xs text-game-fg mb-3">Resumo:</h3>
                <div className="space-y-2 font-sans text-sm">
                  <p><strong>Nome:</strong> {profileName}</p>
                  <p><strong>Cultura:</strong> {selectedCropData?.name[lang]}</p>
                  <p><strong>Estado:</strong> {selectedStateData?.name}</p>
                </div>
              </div>
              
              <PixelButton
                onClick={handleCreateProfile}
                disabled={!canProceed() || creating}
                className="w-full"
              >
                {creating ? 'Criando...' : '🚀 Iniciar Produção'}
              </PixelButton>
            </div>
          )}
        </div>
      </div>
    </GameLayout>
  );
}
