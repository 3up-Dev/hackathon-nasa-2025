import * as React from 'react';
import { useState, useEffect } from 'react';
import { GameLayout } from '@/components/layout/GameLayout';
import { PixelButton } from '@/components/layout/PixelButton';
import { ProductionChecklist } from '@/components/game/ProductionChecklist';
import { StageProgress } from '@/components/game/StageProgress';
import { TimeControls } from '@/components/game/TimeControls';
import { ClimateAlerts } from '@/components/game/ClimateAlerts';
import { translations } from '@/i18n/translations';
import { crops, Crop } from '@/data/crops';
import { brazilStates, BrazilState } from '@/data/states';
import { productionEngine, ProductionState } from '@/lib/productionEngine';
import { SimpleProgress } from '@/components/ui/simple-progress';
import { Heart, Droplets, Leaf, Sparkles } from 'lucide-react';
import { useGameProfiles } from '@/hooks/useGameProfiles';
import { toast } from '@/hooks/use-toast';

export default function ProductionDashboard() {
  const lang: 'pt' | 'en' = 'pt';
  const t = (key: keyof typeof translations['pt']) => translations[lang][key] || key;
  const { currentProfile, updateCurrentProfile } = useGameProfiles();

  const [crop, setCrop] = useState<Crop | null>(null);
  const [state, setState] = useState<BrazilState | null>(null);
  const [productionState, setProductionState] = useState<ProductionState | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    const initializeProduction = async () => {
      const params = new URLSearchParams(window.location.search);
      const cropId = params.get('crop');
      const stateId = params.get('state');

      if (!cropId || !stateId) {
        window.location.href = '/';
        return;
      }

      const selectedCrop = crops.find((c) => c.id === cropId);
      const selectedState = brazilStates.find((s) => s.id === stateId);

      if (!selectedCrop || !selectedState) {
        window.location.href = '/';
        return;
      }

      setCrop(selectedCrop);
      setState(selectedState);

      // Setup production engine with database sync
      productionEngine.setOnStateChange(async (newState) => {
        if (currentProfile) {
          await updateCurrentProfile({
            production_state: newState,
            indicators: {
              production: Math.round((newState.health / 100) * 10),
              sustainability: Math.round((newState.sustainabilityScore / 100) * 10),
              water: Math.max(1, Math.round(10 - (newState.waterUsed / 1000)))
            }
          });
        }
      });

      // PRIORITY 1: Check database for saved state
      if (currentProfile?.production_state) {
        const dbState = currentProfile.production_state as ProductionState;
        console.log('Found production state in database:', dbState);
        
        // Verify it matches current crop/state
        if (dbState.cropId === cropId && dbState.stateId === stateId) {
          console.log('Restoring production from database');
          productionEngine.restoreFromState(dbState);
          setProductionState(dbState);
          return;
        } else {
          console.log('Database state does not match current selection, starting new production');
        }
      }

      // PRIORITY 2: Check localStorage
      const localState = productionEngine.getState();
      if (localState && localState.cropId === cropId && localState.stateId === stateId) {
        console.log('Restoring production from localStorage');
        setProductionState(localState);
        return;
      }

      // PRIORITY 3: Start new production
      console.log('Starting new production');
      const newState = productionEngine.startProduction(selectedCrop, stateId);
      setProductionState(newState);
    };

    if (currentProfile) {
      initializeProduction();
    }
  }, [currentProfile, updateCurrentProfile]);

  if (!crop || !state || !productionState) {
    return (
      <GameLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-6xl animate-pulse">🌱</div>
        </div>
      </GameLayout>
    );
  }

  const handleAdvanceTime = async (days: number) => {
    if (!state) return;
    const newState = await productionEngine.advanceTime(days, crop, {
      latitude: state.lat,
      longitude: state.lon,
    });
    setProductionState(newState);
    setForceUpdate((prev) => prev + 1);
  };

  const handleCompleteTask = (taskId: string) => {
    console.log('handleCompleteTask called with taskId:', taskId);
    
    if (!productionState) {
      console.error('No production state available');
      toast({
        title: lang === 'pt' ? 'Erro' : 'Error',
        description: lang === 'pt' ? 'Estado da produção não encontrado' : 'Production state not found',
        variant: 'destructive',
      });
      return;
    }

    const task = productionState.tasks.find(t => t.id === taskId);
    if (!task) {
      console.error('Task not found:', taskId);
      return;
    }

    if (task.completed) {
      console.log('Task already completed, ignoring');
      return;
    }

    console.log('Completing task:', { taskId, reward: task.reward });

    try {
      const newState = productionEngine.completeTask(taskId);
      console.log('Task completed successfully. New health:', newState.health);
      
      setProductionState(newState);
      setForceUpdate((prev) => prev + 1);

      // Show success toast
      toast({
        title: lang === 'pt' ? '✓ Tarefa Completada!' : '✓ Task Completed!',
        description: lang === 'pt' 
          ? `+${task.reward} saúde adicionada!` 
          : `+${task.reward} health added!`,
        className: 'bg-game-green-700 text-white border-game-green-700',
      });
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: lang === 'pt' ? 'Erro' : 'Error',
        description: lang === 'pt' ? 'Erro ao completar tarefa' : 'Error completing task',
        variant: 'destructive',
      });
    }
  };

  const handleHarvest = async () => {
    const finalState = productionEngine.finishProduction();
    
    // Update profile with final results
    if (currentProfile) {
      const finalScore = Math.round(
        (finalState.health * 0.4) + 
        (finalState.sustainabilityScore * 0.3) + 
        ((100 - Math.min(100, finalState.waterUsed / 50)) * 0.3)
      );
      
      await updateCurrentProfile({
        production_state: finalState,
        total_score: (currentProfile.total_score || 0) + finalScore,
        planted_states: [...new Set([...currentProfile.planted_states, state!.id])],
        indicators: {
          production: Math.round((finalState.health / 100) * 10),
          sustainability: Math.round((finalState.sustainabilityScore / 100) * 10),
          water: Math.max(1, Math.round(10 - (finalState.waterUsed / 1000)))
        }
      });
    }
    
    window.location.href = `/harvest?crop=${crop.id}&state=${state.id}`;
  };

  const isReadyToHarvest = productionState.currentDay >= crop.growthDays;
  const progressPercent = Math.min(100, (productionState.currentDay / crop.growthDays) * 100);

  const stage = productionEngine.getCurrentStage(crop);
  const currentStage = crop.stages[stage.stageIndex];

  return (
    <GameLayout>
      <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
        {/* Header with progress */}
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
              <p className="font-pixel text-2xl text-game-fg">{productionState.currentDay}</p>
              <p className="font-sans text-xs text-game-gray-600">/ {crop.growthDays}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-pixel text-xs text-game-fg">{currentStage.name[lang]}</span>
              <span className="font-sans text-xs text-game-gray-700">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <SimpleProgress value={progressPercent} className="h-3" />
          </div>

          {isReadyToHarvest && (
            <div className="mt-4 p-3 bg-game-gold/20 border-2 border-game-gold rounded-lg animate-pulse">
              <p className="font-pixel text-sm text-game-fg text-center">
                🎉 {lang === 'pt' ? 'Pronto para colheita!' : 'Ready to harvest!'}
              </p>
            </div>
          )}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-game-bg border-4 border-game-fg rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart
                className={`w-5 h-5 ${
                  productionState.health > 70
                    ? 'text-game-green-700'
                    : productionState.health > 40
                    ? 'text-game-gold'
                    : 'text-game-brown'
                }`}
              />
              <span className="font-pixel text-[10px] text-game-fg">
                {lang === 'pt' ? 'Saúde' : 'Health'}
              </span>
            </div>
            <p className="font-pixel text-lg text-game-fg">{productionState.health}%</p>
            <SimpleProgress
              value={productionState.health}
              className="mt-2 h-2"
              indicatorClassName={
                productionState.health > 70
                  ? 'bg-game-green-700'
                  : productionState.health > 40
                  ? 'bg-game-gold'
                  : 'bg-game-brown'
              }
            />
          </div>

          <div className="bg-game-bg border-4 border-game-fg rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-5 h-5 text-game-green-700" />
              <span className="font-pixel text-[10px] text-game-fg">
                {lang === 'pt' ? 'Água Usada' : 'Water Used'}
              </span>
            </div>
            <p className="font-pixel text-lg text-game-fg">{Math.round(productionState.waterUsed)}L</p>
            <p className="font-sans text-xs text-game-gray-600 mt-1">
              {lang === 'pt' ? 'Total acumulado' : 'Total accumulated'}
            </p>
          </div>

          <div className="bg-game-bg border-4 border-game-fg rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-5 h-5 text-game-green-700" />
              <span className="font-pixel text-[10px] text-game-fg leading-tight">
                Sustenta-<br />bilidade
              </span>
            </div>
            <p className="font-pixel text-lg text-game-fg">{productionState.sustainabilityScore}%</p>
            <SimpleProgress value={productionState.sustainabilityScore} className="mt-2 h-2" />
          </div>
        </div>

        {/* Climate Alerts */}
        {productionState.climateEvents && productionState.climateEvents.length > 0 && (
          <div className="bg-game-bg border-4 border-game-fg rounded-xl p-4">
            <ClimateAlerts events={productionState.climateEvents} lang={lang} />
          </div>
        )}

        {/* Stage Progress */}
        <StageProgress crop={crop} currentDay={productionState.currentDay} lang={lang} />

        {/* Checklist */}
        {!isReadyToHarvest && productionState.tasks.length > 0 && (
          <ProductionChecklist
            tasks={productionState.tasks}
            onTaskComplete={handleCompleteTask}
            lang={lang}
          />
        )}

        {/* Time Controls */}
        <TimeControls
          currentDay={productionState.currentDay}
          totalDays={crop.growthDays}
          onAdvanceTime={handleAdvanceTime}
          lang={lang}
          isReadyToHarvest={isReadyToHarvest}
        />

        {/* Harvest button */}
        {isReadyToHarvest && (
          <PixelButton variant="primary" size="lg" onClick={handleHarvest} className="w-full">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>🌾 {lang === 'pt' ? 'Colher Produção' : 'Harvest Production'}</span>
            </div>
          </PixelButton>
        )}

        <PixelButton variant="ghost" onClick={() => (window.location.href = '/')} className="w-full">
          {lang === 'pt' ? 'Voltar ao Início' : 'Back to Home'}
        </PixelButton>
      </div>
    </GameLayout>
  );
}
