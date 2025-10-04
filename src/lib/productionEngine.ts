import { Crop } from '@/data/crops';

export interface ProductionTask {
  id: string;
  type: 'irrigation' | 'temperature' | 'humidity' | 'nutrition' | 'pest';
  title: { pt: string; en: string };
  description: { pt: string; en: string };
  completed: boolean;
  penalty: number;
  reward: number;
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
}

export interface ClimateEvent {
  type: 'drought' | 'flood' | 'heat' | 'cold' | 'pest';
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

  constructor() {
    this.loadState();
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

  advanceTime(days: number, crop: Crop): ProductionState {
    if (!this.state) throw new Error('No active production');

    const newDay = this.state.currentDay + days;
    
    // Calculate penalties for incomplete tasks
    const incompleteTasks = this.state.tasks.filter(t => !t.completed);
    const healthPenalty = incompleteTasks.reduce((acc, task) => acc + task.penalty, 0);
    
    // Generate new tasks every 7 days
    let newTasks = this.state.tasks;
    if (newDay % 7 === 0 && newDay < crop.growthDays) {
      newTasks = this.generateTasks();
    }
    
    // Calculate water consumption based on crop and stage
    const stage = this.getCurrentStage(crop);
    const currentStageData = crop.stages[stage.stageIndex];
    const waterMultiplier = currentStageData.waterNeeds === 'high' ? 1.5 : 
                           currentStageData.waterNeeds === 'medium' ? 1.0 : 0.7;
    const waterConsumption = days * 10 * waterMultiplier;
    
    // Random climate events (10% chance per week)
    const climateEvent = Math.random() < 0.1 ? this.generateClimateEvent() : null;
    
    let healthChange = -healthPenalty;
    let waterChange = waterConsumption;
    let sustainabilityChange = 0;
    
    if (climateEvent) {
      healthChange += climateEvent.impact.health;
      waterChange += climateEvent.impact.water;
      sustainabilityChange += climateEvent.impact.sustainability;
    }
    
    this.state = {
      ...this.state,
      currentDay: newDay,
      health: Math.max(0, Math.min(100, this.state.health + healthChange)),
      tasks: newTasks,
      waterUsed: this.state.waterUsed + waterChange,
      sustainabilityScore: Math.max(0, Math.min(100, this.state.sustainabilityScore + sustainabilityChange)),
    };
    
    this.saveState();
    return this.state;
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

  resetProduction(): void {
    this.state = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  private generateTasks(): ProductionTask[] {
    const allTasks: ProductionTask[] = [
      {
        id: `irrigation-${Date.now()}`,
        type: 'irrigation',
        title: { pt: 'Irrigar Plantação', en: 'Irrigate Crops' },
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
