import { Crop } from '@/data/crops';
import { supabase } from '@/integrations/supabase/client';
import { BrazilState } from '@/data/states';

export interface ProductionTask {
  id: string;
  type: 'irrigation' | 'temperature' | 'humidity' | 'nutrition' | 'pest';
  title: { pt: string; en: string };
  description: { pt: string; en: string };
  completed: boolean;
  penalty: number;
  reward: number;
}

export interface RealClimateData {
  temperature: number;
  precipitation: number;
  humidity: number;
  evapotranspiration: number;
}

export interface ProductionState {
  cropId: string;
  stateId: string;
  currentDay: number;
  health: number;
  tasks: ProductionTask[];
  waterUsed: number;
  sustainabilityScore: number;
  isComplete: boolean;
  startedAt: number;
  completedTasks: string[];
  realClimateData?: RealClimateData;
  climateEvents?: ClimateEvent[];
}

export interface ClimateEvent {
  type: 'drought' | 'flood' | 'heat' | 'cold' | 'pest' | 'fire' | 'storm';
  severity: 'low' | 'medium' | 'high';
  description: { pt: string; en: string };
  impact: {
    health: number;
    water: number;
    sustainability: number;
  };
}

const STORAGE_KEY = 'plantando-futuro-production';

export class ProductionEngine {
  private state: ProductionState | null = null;
  private onStateChange?: (state: ProductionState) => void | Promise<void>;

  constructor() {
    this.loadState();
  }

  setOnStateChange(callback: (state: ProductionState) => void | Promise<void>): void {
    this.onStateChange = callback;
  }

  private loadState(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.state = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading production state:', error);
    }
  }

  private saveState(): void {
    if (this.state) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        // Trigger database sync callback if set
        if (this.onStateChange) {
          this.onStateChange(this.state);
        }
      } catch (error) {
        console.error('Error saving production state:', error);
      }
    }
  }

  startProduction(crop: Crop, stateId: string): ProductionState {
    this.state = {
      cropId: crop.id,
      stateId,
      currentDay: 0,
      health: 100,
      tasks: this.generateTasks(),
      waterUsed: 0,
      sustainabilityScore: 100,
      isComplete: false,
      startedAt: Date.now(),
      completedTasks: [],
    };
    this.saveState();
    return this.state;
  }

  async advanceTime(days: number, crop: Crop, stateLocation?: { latitude: number; longitude: number }): Promise<ProductionState> {
    if (!this.state) throw new Error('No active production');

    const newDay = this.state.currentDay + days;
    
    // Calculate penalties for incomplete tasks
    const incompleteTasks = this.state.tasks.filter(t => !t.completed);
    const healthPenalty = incompleteTasks.reduce((acc, task) => acc + task.penalty, 0);
    
    // Fetch real climate data for this period
    let realClimateData: RealClimateData | undefined;
    let detectedAnomalies: { drought: boolean; flood: boolean; heatWave: boolean; coldSnap: boolean; fireRisk: boolean; stormRisk: boolean } | undefined;
    
    if (stateLocation) {
      try {
        const climateResult = await this.fetchRealClimateData(stateLocation, days);
        if (climateResult) {
          realClimateData = climateResult.data;
          detectedAnomalies = climateResult.anomalies;
        }
      } catch (error) {
        console.error('Error fetching climate data:', error);
      }
    }
    
    // Calculate health based on real climate data
    let healthChange = -healthPenalty;
    let waterChange = 0;
    let sustainabilityChange = 0;
    const climateEvents: ClimateEvent[] = this.state.climateEvents || [];
    
    if (realClimateData) {
      // Compare real temperature with crop ideal range
      const [minTemp, maxTemp] = crop.idealTemp;
      const tempMid = (minTemp + maxTemp) / 2;
      const tempDiff = Math.abs(realClimateData.temperature - tempMid);
      if (tempDiff > 10) {
        healthChange -= 15;
      } else if (tempDiff > 5) {
        healthChange -= 5;
      }
      
      // Check precipitation vs crop needs
      const [minRain, maxRain] = crop.idealRain;
      const precipNeeded = minRain / 365 * days; // Daily average
      if (realClimateData.precipitation < precipNeeded * 0.5) {
        healthChange -= 10;
        waterChange += 50; // Need more irrigation
      } else if (realClimateData.precipitation > precipNeeded * 2) {
        healthChange -= 8;
        sustainabilityChange -= 5;
      }
      
      // Calculate real water consumption using evapotranspiration
      const stage = this.getCurrentStage(crop);
      const currentStageData = crop.stages[stage.stageIndex];
      const cropCoefficient = currentStageData.waterNeeds === 'high' ? 1.2 : 
                             currentStageData.waterNeeds === 'medium' ? 0.9 : 0.6;
      waterChange += realClimateData.evapotranspiration * cropCoefficient * days;
      
      // Generate climate events from detected anomalies
      if (detectedAnomalies) {
        if (detectedAnomalies.drought) {
          const droughtEvent: ClimateEvent = {
            type: 'drought',
            severity: 'high',
            description: { pt: '🌵 Seca detectada pelos dados da NASA', en: '🌵 Drought detected by NASA data' },
            impact: { health: -15, water: 60, sustainability: -8 }
          };
          climateEvents.push(droughtEvent);
          healthChange += droughtEvent.impact.health;
          waterChange += droughtEvent.impact.water;
          sustainabilityChange += droughtEvent.impact.sustainability;
        }
        
        if (detectedAnomalies.flood) {
          const floodEvent: ClimateEvent = {
            type: 'flood',
            severity: 'high',
            description: { pt: '🌊 Excesso de chuva detectado pela NASA', en: '🌊 Excess rainfall detected by NASA' },
            impact: { health: -20, water: -30, sustainability: -12 }
          };
          climateEvents.push(floodEvent);
          healthChange += floodEvent.impact.health;
          waterChange += floodEvent.impact.water;
          sustainabilityChange += floodEvent.impact.sustainability;
        }
        
        if (detectedAnomalies.heatWave) {
          const heatEvent: ClimateEvent = {
            type: 'heat',
            severity: 'high',
            description: { pt: '🌡️ Onda de calor detectada pela NASA', en: '🌡️ Heat wave detected by NASA' },
            impact: { health: -12, water: 40, sustainability: -5 }
          };
          climateEvents.push(heatEvent);
          healthChange += heatEvent.impact.health;
          waterChange += heatEvent.impact.water;
          sustainabilityChange += heatEvent.impact.sustainability;
        }
        
        if (detectedAnomalies.coldSnap) {
          const coldEvent: ClimateEvent = {
            type: 'cold',
            severity: 'medium',
            description: { pt: '❄️ Frio intenso detectado pela NASA', en: '❄️ Cold snap detected by NASA' },
            impact: { health: -10, water: -10, sustainability: -3 }
          };
          climateEvents.push(coldEvent);
          healthChange += coldEvent.impact.health;
          waterChange += coldEvent.impact.water;
          sustainabilityChange += coldEvent.impact.sustainability;
        }
        
        if (detectedAnomalies.fireRisk) {
          const fireEvent: ClimateEvent = {
            type: 'fire',
            severity: 'high',
            description: { pt: '🔥 Risco de Incêndio Detectado pela NASA', en: '🔥 Fire Risk Detected by NASA' },
            impact: { health: -25, water: 80, sustainability: -15 }
          };
          climateEvents.push(fireEvent);
          healthChange += fireEvent.impact.health;
          waterChange += fireEvent.impact.water;
          sustainabilityChange += fireEvent.impact.sustainability;
        }
        
        if (detectedAnomalies.stormRisk) {
          const stormEvent: ClimateEvent = {
            type: 'storm',
            severity: 'high',
            description: { pt: '⛈️ Tempestade Severa Detectada pela NASA', en: '⛈️ Severe Storm Detected by NASA' },
            impact: { health: -18, water: -20, sustainability: -10 }
          };
          climateEvents.push(stormEvent);
          healthChange += stormEvent.impact.health;
          waterChange += stormEvent.impact.water;
          sustainabilityChange += stormEvent.impact.sustainability;
        }
      }
    } else {
      // Fallback to old calculation if no real data
      const stage = this.getCurrentStage(crop);
      const currentStageData = crop.stages[stage.stageIndex];
      const waterMultiplier = currentStageData.waterNeeds === 'high' ? 1.5 : 
                             currentStageData.waterNeeds === 'medium' ? 1.0 : 0.7;
      waterChange = days * 10 * waterMultiplier;
    }
    
    // Generate new tasks (weekly regular + climate-based)
    let newTasks = this.state.tasks;
    if (newDay % 7 === 0 && newDay < crop.growthDays) {
      newTasks = this.generateTasks();
      
      // Add climate-based tasks
      if (realClimateData) {
        const climateTasks = this.generateClimateBasedTasks(realClimateData, crop);
        newTasks = [...newTasks, ...climateTasks];
      }
    }
    
    this.state = {
      ...this.state,
      currentDay: newDay,
      health: Math.max(0, Math.min(100, this.state.health + healthChange)),
      tasks: newTasks,
      waterUsed: this.state.waterUsed + waterChange,
      sustainabilityScore: Math.max(0, Math.min(100, this.state.sustainabilityScore + sustainabilityChange)),
      realClimateData,
      climateEvents,
    };
    
    this.saveState();
    return this.state;
  }

  private async fetchRealClimateData(
    location: { latitude: number; longitude: number }, 
    daysCount: number
  ): Promise<{ data: RealClimateData; anomalies: { drought: boolean; flood: boolean; heatWave: boolean; coldSnap: boolean; fireRisk: boolean; stormRisk: boolean } } | null> {
    try {
      const { data, error } = await supabase.functions.invoke('get-nasa-climate-data', {
        body: {
          latitude: location.latitude,
          longitude: location.longitude,
          daysCount,
        }
      });

      if (error) throw error;
      
      if (data && data.isRealData) {
        return {
          data: {
            temperature: data.temperature,
            precipitation: data.precipitation,
            humidity: data.humidity,
            evapotranspiration: data.evapotranspiration,
          },
          anomalies: data.anomalies,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching NASA climate data:', error);
      return null;
    }
  }

  private generateClimateBasedTasks(climateData: RealClimateData, crop: Crop): ProductionTask[] {
    const tasks: ProductionTask[] = [];
    
    // Low rainfall -> urgent irrigation
    const dailyPrecip = climateData.precipitation;
    if (dailyPrecip < 2) {
      tasks.push({
        id: `urgent-irrigation-${Date.now()}`,
        type: 'irrigation',
        title: { pt: '⚠️ Irrigação Urgente', en: '⚠️ Urgent Irrigation' },
        description: { 
          pt: `Baixa precipitação detectada (${dailyPrecip.toFixed(1)}mm). Irrigar imediatamente!`,
          en: `Low precipitation detected (${dailyPrecip.toFixed(1)}mm). Irrigate immediately!`
        },
        completed: false,
        penalty: 10,
        reward: 8,
      });
    }
    
    // Temperature out of ideal range
    const [minTemp, maxTemp] = crop.idealTemp;
    const tempMid = (minTemp + maxTemp) / 2;
    if (climateData.temperature > maxTemp) {
      tasks.push({
        id: `heat-control-${Date.now()}`,
        type: 'temperature',
        title: { pt: '🌡️ Controle de Calor', en: '🌡️ Heat Control' },
        description: {
          pt: `Temperatura alta (${climateData.temperature}°C). Implementar sombreamento!`,
          en: `High temperature (${climateData.temperature}°C). Implement shading!`
        },
        completed: false,
        penalty: 8,
        reward: 6,
      });
    } else if (climateData.temperature < minTemp) {
      tasks.push({
        id: `cold-protection-${Date.now()}`,
        type: 'temperature',
        title: { pt: '❄️ Proteção contra Frio', en: '❄️ Cold Protection' },
        description: {
          pt: `Temperatura baixa (${climateData.temperature}°C). Proteger cultivo!`,
          en: `Low temperature (${climateData.temperature}°C). Protect crops!`
        },
        completed: false,
        penalty: 8,
        reward: 6,
      });
    }
    
    // Low humidity
    if (climateData.humidity < 40) {
      tasks.push({
        id: `humidity-control-${Date.now()}`,
        type: 'humidity',
        title: { pt: '💧 Aumentar Umidade', en: '💧 Increase Humidity' },
        description: {
          pt: `Umidade baixa (${climateData.humidity}%). Umidificar ambiente!`,
          en: `Low humidity (${climateData.humidity}%). Humidify environment!`
        },
        completed: false,
        penalty: 5,
        reward: 4,
      });
    }
    
    return tasks;
  }

  completeTask(taskId: string): ProductionState {
    if (!this.state) throw new Error('No active production');
    
    const task = this.state.tasks.find(t => t.id === taskId);
    if (!task || task.completed) return this.state;
    
    const updatedTasks = this.state.tasks.map(t =>
      t.id === taskId ? { ...t, completed: true } : t
    );
    
    this.state = {
      ...this.state,
      tasks: updatedTasks,
      health: Math.min(100, this.state.health + task.reward),
      sustainabilityScore: Math.min(100, this.state.sustainabilityScore + 2),
      completedTasks: [...this.state.completedTasks, taskId],
    };
    
    this.saveState();
    return this.state;
  }

  getCurrentStage(crop: Crop): { stageIndex: number; daysInStage: number; progress: number } {
    if (!this.state) throw new Error('No active production');
    
    const { currentDay } = this.state;
    let accumulatedDays = 0;
    
    for (let i = 0; i < crop.stages.length; i++) {
      const stage = crop.stages[i];
      if (currentDay < accumulatedDays + stage.daysToComplete) {
        const daysInStage = currentDay - accumulatedDays;
        const progress = (daysInStage / stage.daysToComplete) * 100;
        return { stageIndex: i, daysInStage, progress };
      }
      accumulatedDays += stage.daysToComplete;
    }
    
    // Last stage complete
    return {
      stageIndex: crop.stages.length - 1,
      daysInStage: crop.stages[crop.stages.length - 1].daysToComplete,
      progress: 100,
    };
  }

  finishProduction(): ProductionState {
    if (!this.state) throw new Error('No active production');
    
    this.state = {
      ...this.state,
      isComplete: true,
    };
    
    this.saveState();
    return this.state;
  }

  getState(): ProductionState | null {
    return this.state;
  }

  restoreFromState(state: ProductionState): void {
    console.log('Restoring production state from database:', state);
    this.state = state;
    // Update localStorage to match database
    this.saveState();
  }

  resetProduction(): void {
    this.state = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  private generateTasks(): ProductionTask[] {
    const allTasks: ProductionTask[] = [
      {
        id: `irrigation-${Date.now()}`,
        type: 'irrigation',
        title: { pt: 'Irrigar Produção', en: 'Irrigate Production' },
        description: { pt: 'Verificar e ajustar irrigação', en: 'Check and adjust irrigation' },
        completed: false,
        penalty: 5,
        reward: 3,
      },
      {
        id: `temperature-${Date.now()}`,
        type: 'temperature',
        title: { pt: 'Controlar Temperatura', en: 'Control Temperature' },
        description: { pt: 'Monitorar temperatura ambiente', en: 'Monitor ambient temperature' },
        completed: false,
        penalty: 4,
        reward: 2,
      },
      {
        id: `humidity-${Date.now()}`,
        type: 'humidity',
        title: { pt: 'Verificar Umidade', en: 'Check Humidity' },
        description: { pt: 'Monitorar níveis de umidade', en: 'Monitor humidity levels' },
        completed: false,
        penalty: 3,
        reward: 2,
      },
      {
        id: `nutrition-${Date.now()}`,
        type: 'nutrition',
        title: { pt: 'Aplicar Nutrientes', en: 'Apply Nutrients' },
        description: { pt: 'Fornecer fertilizantes necessários', en: 'Provide necessary fertilizers' },
        completed: false,
        penalty: 4,
        reward: 3,
      },
      {
        id: `pest-${Date.now()}`,
        type: 'pest',
        title: { pt: 'Controle de Pragas', en: 'Pest Control' },
        description: { pt: 'Verificar e prevenir pragas', en: 'Check and prevent pests' },
        completed: false,
        penalty: 6,
        reward: 4,
      },
    ];
    
    // Return 3-4 random tasks
    const shuffled = allTasks.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3 + Math.floor(Math.random() * 2));
  }

  private generateClimateEvent(): ClimateEvent {
    const events: ClimateEvent[] = [
      {
        type: 'drought',
        severity: 'medium',
        description: {
          pt: '🌵 Seca prolongada na região',
          en: '🌵 Prolonged drought in the region',
        },
        impact: { health: -10, water: 50, sustainability: -5 },
      },
      {
        type: 'flood',
        severity: 'high',
        description: {
          pt: '🌊 Chuvas intensas causaram alagamento',
          en: '🌊 Heavy rains caused flooding',
        },
        impact: { health: -15, water: -20, sustainability: -10 },
      },
      {
        type: 'heat',
        severity: 'medium',
        description: {
          pt: '🌡️ Onda de calor extremo',
          en: '🌡️ Extreme heat wave',
        },
        impact: { health: -8, water: 30, sustainability: -3 },
      },
      {
        type: 'pest',
        severity: 'high',
        description: {
          pt: '🐛 Infestação de pragas detectada',
          en: '🐛 Pest infestation detected',
        },
        impact: { health: -20, water: 0, sustainability: -8 },
      },
    ];
    
    return events[Math.floor(Math.random() * events.length)];
  }
}

// Singleton instance
export const productionEngine = new ProductionEngine();
