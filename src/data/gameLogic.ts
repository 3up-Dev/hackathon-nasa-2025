/**
 * Este arquivo foi desenvolvido com assistência de Inteligência Artificial.
 * Lógica de cálculo de viabilidade de cultivo baseada em dados climáticos.
 * 
 * This file was developed with Artificial Intelligence assistance.
 * Crop viability calculation logic based on climate data.
 */

import { Crop } from './crops';
import { BrazilState } from './states';

export interface ViabilityResult {
  isViable: boolean;
  reasons: string[];
  suggestedStates: string[];
  scores: {
    production: number;
    sustainability: number;
    water: number;
  };
  isRealData?: boolean;
  successRate: number; // 0-100 percentage
}

export const calculateViability = (
  crop: Crop,
  state: BrazilState,
  realClimateData?: { temperature: number; precipitation: number; isRealData: boolean }
): ViabilityResult => {
  const reasons: string[] = [];
  let isViable = true;

  // Use real data if available, otherwise use simulated data
  const temp = realClimateData?.temperature ?? state.temp;
  const rain = realClimateData?.precipitation ?? state.rain;
  const isRealData = realClimateData?.isRealData ?? false;

  // Calculate temperature match percentage (0-100%)
  const [minTemp, maxTemp] = crop.idealTemp;
  const tempRange = maxTemp - minTemp;
  let tempScore = 0;
  
  if (temp < minTemp) {
    // Below minimum - calculate how far off
    const deviation = minTemp - temp;
    tempScore = Math.max(0, 100 - (deviation / minTemp) * 100);
    reasons.push('reason_low_temp');
    isViable = false;
  } else if (temp > maxTemp) {
    // Above maximum - calculate how far off
    const deviation = temp - maxTemp;
    tempScore = Math.max(0, 100 - (deviation / maxTemp) * 100);
    reasons.push('reason_high_temp');
    isViable = false;
  } else {
    // Within range - perfect score or close to edges
    const distanceFromMin = temp - minTemp;
    const distanceFromMax = maxTemp - temp;
    const closestEdgeDistance = Math.min(distanceFromMin, distanceFromMax);
    tempScore = 70 + (closestEdgeDistance / tempRange) * 30; // 70-100% when in range
  }

  // Calculate rainfall match percentage (0-100%)
  const [minRain] = crop.idealRain;
  let rainScore = 0;
  
  if (rain < minRain) {
    // Below minimum rainfall
    rainScore = (rain / minRain) * 100;
    reasons.push('reason_low_rain');
    isViable = false;
  } else {
    // Adequate or more rainfall
    rainScore = 100;
  }

  // Soil compatibility check
  const soilPenalty = crop.idealSoil.includes(state.soil) ? 0 : 25;
  if (soilPenalty > 0) {
    reasons.push('reason_bad_soil');
    isViable = false;
  }

  // Calculate final success rate (weighted average)
  // Temperature: 40%, Rainfall: 40%, Soil: 20%
  const successRate = Math.round(
    (tempScore * 0.4) + 
    (rainScore * 0.4) + 
    ((100 - soilPenalty) * 0.2)
  );

  // Calculate scores based on success rate
  const scores = {
    production: Math.round(successRate * 0.15),
    sustainability: Math.round(successRate * 0.10),
    water: crop.waterConsumption === 'high' ? 8 : crop.waterConsumption === 'medium' ? 5 : 3,
  };

  return {
    isViable,
    reasons: reasons.slice(0, 2), // Max 2 reasons
    suggestedStates: [], // Will be filled by hook
    scores,
    isRealData,
    successRate,
  };
};

export const calculateFinalScore = (indicators: { production: number; sustainability: number; water: number }) => {
  return Math.round(
    indicators.production * 0.4 +
    indicators.sustainability * 0.4 +
    indicators.water * 0.2
  );
};

export const getMedalType = (score: number): 'gold' | 'silver' | 'bronze' => {
  if (score >= 80) return 'gold';
  if (score >= 60) return 'silver';
  return 'bronze';
};
