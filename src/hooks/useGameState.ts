import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameState {
  selectedCrop: string | null;
  indicators: {
    production: number;
    sustainability: number;
    water: number;
  };
  plantedStates: string[];
  totalScore: number;
  setSelectedCrop: (crop: string | null) => void;
  addPlanting: (stateId: string, scores: { production: number; sustainability: number; water: number }) => void;
  resetGame: () => void;
}

const initialState = {
  selectedCrop: null,
  indicators: {
    production: 10,
    sustainability: 10,
    water: 10,
  },
  plantedStates: [],
  totalScore: 0,
};

export const useGameState = create<GameState>()(
  persist(
    (set) => ({
      ...initialState,
      setSelectedCrop: (crop) => set({ selectedCrop: crop }),
      addPlanting: (stateId, scores) =>
        set((state) => {
          if (state.plantedStates.includes(stateId)) {
            return state;
          }
          
          const newIndicators = {
            production: Math.min(100, state.indicators.production + scores.production),
            sustainability: Math.min(100, state.indicators.sustainability + scores.sustainability),
            water: Math.min(100, state.indicators.water + scores.water),
          };
          
          const newScore = Math.round(
            newIndicators.production * 0.4 +
            newIndicators.sustainability * 0.4 +
            newIndicators.water * 0.2
          );
          
          return {
            indicators: newIndicators,
            plantedStates: [...state.plantedStates, stateId],
            totalScore: newScore,
          };
        }),
      resetGame: () => set(initialState),
    }),
    {
      name: 'plantando-futuro-game',
    }
  )
);
