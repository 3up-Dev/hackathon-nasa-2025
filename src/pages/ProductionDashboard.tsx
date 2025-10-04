import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GameLayout } from '@/components/layout/GameLayout';
import { PixelButton } from '@/components/layout/PixelButton';
import { useLanguage } from '@/hooks/useLanguage';
import { useProductionCycle } from '@/hooks/useProductionCycle';
import { ProductionChecklist } from '@/components/game/ProductionChecklist';
import { crops, Crop } from '@/data/crops';
import { brazilStates, BrazilState } from '@/data/states';
import { Heart, Droplets, Leaf, Calendar, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function ProductionDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, lang } = useLanguage();
  const [crop, setCrop] = useState<Crop | null>(null);
  const [state, setState] = useState<BrazilState | null>(null);

  const {
    cropId,
    stateId,
    currentDay,
    health,
    tasks,
    waterUsed,
    sustainabilityScore,
    startProduction,
    advanceTime,
    completeTask,
    getCurrentStage,
    finishProduction,
  } = useProductionCycle();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paramCropId = params.get('crop');
    const paramStateId = params.get('state');

    if (!paramCropId || !paramStateId) {
      navigate('/game');
      return;
    }

    const selectedCrop = crops.find(c => c.id === paramCropId);
    const selectedState = brazilStates.find(s => s.id === paramStateId);

    if (!selectedCrop || !selectedState) {
      navigate('/game');
      return;
    }

    setCrop(selectedCrop);
    setState(selectedState);

    // Iniciar produção se ainda não iniciou
    if (!cropId) {
      startProduction(selectedCrop, paramStateId);
    }
  }, [location, navigate, cropId, startProduction]);

  if (!crop || !state) {
    return null;
  }

  const stage = getCurrentStage(crop);
  const currentStage = crop.stages[stage.stageIndex];
  const progressPercent = (currentDay / crop.growthDays) * 100;

  const handleAdvanceWeek = () => {
    advanceTime(7);
  };

  const handleAdvanceMonth = () => {
    advanceTime(30);
  };

  const handleHarvest = () => {
    finishProduction();
    navigate(`/harvest?crop=${crop.id}&state=${state.id}`);
  };

  const isReadyToHarvest = currentDay >= crop.growthDays;

  return (
    <GameLayout>
      <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
        {/* Header com progresso */}
        <div className="bg-game-bg border-4 border-game-fg rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="text-6xl">{crop.icon}</div>
              <div>
                <h2 className="font-pixel text-lg text-game-fg">{crop.name[lang]}</h2>
                <p className="font-sans text-sm text-game-gray-700">{state.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-pixel text-xs text-game-gray-700">
                {lang === 'pt' ? 'Dia' : 'Day'}
              </p>
              <p className="font-pixel text-2xl text-game-fg">{currentDay}</p>
              <p className="font-sans text-xs text-game-gray-600">
                / {crop.growthDays}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-pixel text-xs text-game-fg">
                {currentStage.name[lang]}
              </span>
              <span className="font-sans text-xs text-game-gray-700">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>

          {isReadyToHarvest && (
            <div className="mt-4 p-3 bg-game-gold/20 border-2 border-game-gold rounded-lg animate-pulse">
              <p className="font-pixel text-sm text-game-fg text-center">
                🎉 {lang === 'pt' ? 'Pronto para colheita!' : 'Ready to harvest!'}
              </p>
            </div>
          )}
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-game-bg border-4 border-game-fg rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-game-brown" />
              <span className="font-pixel text-xs text-game-fg">
                {lang === 'pt' ? 'Saúde' : 'Health'}
              </span>
            </div>
            <p className="font-pixel text-2xl text-game-fg">{health}%</p>
            <Progress value={health} className="mt-2 h-2" />
          </div>

          <div className="bg-game-bg border-4 border-game-fg rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-5 h-5 text-game-green-700" />
              <span className="font-pixel text-xs text-game-fg">
                {lang === 'pt' ? 'Água Usada' : 'Water Used'}
              </span>
            </div>
            <p className="font-pixel text-2xl text-game-fg">{waterUsed}L</p>
            <p className="font-sans text-xs text-game-gray-600 mt-1">
              {lang === 'pt' ? 'Total acumulado' : 'Total accumulated'}
            </p>
          </div>

          <div className="bg-game-bg border-4 border-game-fg rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-5 h-5 text-game-green-700" />
              <span className="font-pixel text-xs text-game-fg">
                {lang === 'pt' ? 'Sustentabilidade' : 'Sustainability'}
              </span>
            </div>
            <p className="font-pixel text-2xl text-game-fg">{sustainabilityScore}%</p>
            <Progress value={sustainabilityScore} className="mt-2 h-2" />
          </div>
        </div>

        {/* Checklist */}
        {!isReadyToHarvest && (
          <ProductionChecklist tasks={tasks} onTaskComplete={completeTask} />
        )}

        {/* Controles de tempo */}
        {!isReadyToHarvest && (
          <div className="bg-game-bg border-4 border-game-fg rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-game-fg" />
              <h3 className="font-pixel text-base text-game-fg">
                {lang === 'pt' ? 'Avançar Tempo' : 'Advance Time'}
              </h3>
            </div>
            
            <div className="flex gap-4">
              <PixelButton
                variant="secondary"
                onClick={handleAdvanceWeek}
                className="flex-1"
              >
                <div className="flex items-center justify-center gap-2">
                  <span>+7 {lang === 'pt' ? 'dias' : 'days'}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </PixelButton>
              
              <PixelButton
                variant="secondary"
                onClick={handleAdvanceMonth}
                className="flex-1"
              >
                <div className="flex items-center justify-center gap-2">
                  <span>+30 {lang === 'pt' ? 'dias' : 'days'}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </PixelButton>
            </div>

            <p className="font-sans text-xs text-game-gray-700 text-center mt-3">
              {lang === 'pt'
                ? 'Complete as tarefas antes de avançar o tempo para manter a saúde da produção'
                : 'Complete tasks before advancing time to maintain production health'}
            </p>
          </div>
        )}

        {/* Botão de colheita */}
        {isReadyToHarvest && (
          <PixelButton
            variant="primary"
            size="lg"
            onClick={handleHarvest}
            className="w-full"
          >
            🌾 {lang === 'pt' ? 'Colher Produção' : 'Harvest Production'}
          </PixelButton>
        )}

        <PixelButton
          variant="ghost"
          onClick={() => navigate('/game')}
          className="w-full"
        >
          {lang === 'pt' ? 'Voltar ao Mapa' : 'Back to Map'}
        </PixelButton>
      </div>
    </GameLayout>
  );
}
