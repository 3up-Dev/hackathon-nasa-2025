/**
 * Este arquivo foi desenvolvido com assistência de Inteligência Artificial.
 * Toda a lógica, estrutura e implementação foram revisadas e validadas pela equipe humana.
 * 
 * This file was developed with Artificial Intelligence assistance.
 * All logic, structure, and implementation were reviewed and validated by the human team.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameState {
  selectedSector: string | null;
  selectedCrop: string | null;
  indicators: {
    production: number;
    sustainability: number;
    water: number;
  };
  plantedStates: string[];
  totalScore: number;
  setSelectedSector: (sector: string | null) => void;
  setSelectedCrop: (crop: string | null) => void;
  addPlanting: (stateId: string, scores: { production: number; sustainability: number; water: number }) => void;
  resetGame: () => void;
}

const initialState = {
  selectedSector: null,
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
      setSelectedSector: (sector) => set({ selectedSector: sector, selectedCrop: null }),
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
