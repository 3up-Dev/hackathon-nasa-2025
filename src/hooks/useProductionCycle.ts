import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

export interface ProductionCycleState {
  cropId: string | null;
  stateId: string | null;
  currentDay: number;
  health: number;
  tasks: ProductionTask[];
  waterUsed: number;
  sustainabilityScore: number;
  isComplete: boolean;
  startProduction: (crop: Crop, stateId: string) => void;
  advanceTime: (days: number) => void;
  completeTask: (taskId: string) => void;
  getCurrentStage: (crop: Crop) => { stageIndex: number; daysInStage: number; progress: number };
  finishProduction: () => void;
  resetProduction: () => void;
}

const initialState = {
  cropId: null,
  stateId: null,
  currentDay: 0,
  health: 100,
  tasks: [],
  waterUsed: 0,
  sustainabilityScore: 100,
  isComplete: false,
};

export const useProductionCycle = create<ProductionCycleState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      startProduction: (crop: Crop, stateId: string) => {
        set({
          cropId: crop.id,
          stateId,
          currentDay: 0,
          health: 100,
          tasks: generateInitialTasks(),
          waterUsed: 0,
          sustainabilityScore: 100,
          isComplete: false,
        });
      },

      advanceTime: (days: number) => {
        const state = get();
        const newDay = state.currentDay + days;
        
        // Penalidade por tarefas não completadas
        const incompleteTasks = state.tasks.filter(t => !t.completed);
        const healthPenalty = incompleteTasks.reduce((acc, task) => acc + task.penalty, 0);
        
        // Gerar novas tarefas a cada 7 dias
        let newTasks = state.tasks;
        if (newDay % 7 === 0) {
          newTasks = generateInitialTasks();
        }
        
        set({
          currentDay: newDay,
          health: Math.max(0, state.health - healthPenalty),
          tasks: newTasks,
          waterUsed: state.waterUsed + (days * 10), // Consumo simulado
        });
      },

      completeTask: (taskId: string) => {
        const state = get();
        const updatedTasks = state.tasks.map(task =>
          task.id === taskId ? { ...task, completed: true } : task
        );
        
        const task = state.tasks.find(t => t.id === taskId);
        const healthBonus = task ? task.reward : 0;
        
        set({
          tasks: updatedTasks,
          health: Math.min(100, state.health + healthBonus),
          sustainabilityScore: Math.min(100, state.sustainabilityScore + 2),
        });
      },

      getCurrentStage: (crop: Crop) => {
        const { currentDay } = get();
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
        
        // Última etapa completa
        return { 
          stageIndex: crop.stages.length - 1, 
          daysInStage: crop.stages[crop.stages.length - 1].daysToComplete, 
          progress: 100 
        };
      },

      finishProduction: () => {
        set({ isComplete: true });
      },

      resetProduction: () => {
        set(initialState);
      },
    }),
    {
      name: 'plantando-futuro-production',
    }
  )
);

function generateInitialTasks(): ProductionTask[] {
  return [
    {
      id: 'irrigation',
      type: 'irrigation',
      title: { pt: 'Irrigar Plantação', en: 'Irrigate Crops' },
      description: { pt: 'Verificar e ajustar irrigação', en: 'Check and adjust irrigation' },
      completed: false,
      penalty: 5,
      reward: 3,
    },
    {
      id: 'temperature',
      type: 'temperature',
      title: { pt: 'Controlar Temperatura', en: 'Control Temperature' },
      description: { pt: 'Monitorar temperatura ambiente', en: 'Monitor ambient temperature' },
      completed: false,
      penalty: 4,
      reward: 2,
    },
    {
      id: 'humidity',
      type: 'humidity',
      title: { pt: 'Verificar Umidade', en: 'Check Humidity' },
      description: { pt: 'Monitorar níveis de umidade', en: 'Monitor humidity levels' },
      completed: false,
      penalty: 3,
      reward: 2,
    },
    {
      id: 'nutrition',
      type: 'nutrition',
      title: { pt: 'Aplicar Nutrientes', en: 'Apply Nutrients' },
      description: { pt: 'Fornecer fertilizantes necessários', en: 'Provide necessary fertilizers' },
      completed: false,
      penalty: 4,
      reward: 3,
    },
  ];
}
