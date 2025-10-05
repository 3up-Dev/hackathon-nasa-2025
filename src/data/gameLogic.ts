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

export interface ProductionTimeResult {
  baseDays: number;
  adjustedDays: number;
  adjustmentFactor: number;
  estimatedWeeks: number;
  estimatedMonths: number;
  speed: 'fast' | 'normal' | 'slow';
  explanation: { pt: string; en: string };
}

export const calculateProductionTime = (
  crop: Crop,
  successRate: number,
  realClimateData?: {
    temperature: number;
    precipitation: number;
    humidity?: number;
    evapotranspiration?: number;
    anomalies?: {
      drought?: boolean;
      heatWave?: boolean;
      flood?: boolean;
    };
  }
): ProductionTimeResult => {
  // Base production time from crop
  const baseDays = crop.stages.reduce((sum, stage) => sum + stage.daysToComplete, 0);
  
  // Start with base adjustment from success rate
  // High success rate (>80%) = faster growth (0.9x)
  // Medium success rate (50-80%) = normal (1.0x)
  // Low success rate (<50%) = slower (1.2x-1.4x)
  let adjustmentFactor = 1.0;
  
  if (successRate >= 80) {
    adjustmentFactor = 0.90; // Ideal conditions accelerate 10%
  } else if (successRate >= 60) {
    adjustmentFactor = 1.0; // Normal
  } else if (successRate >= 40) {
    adjustmentFactor = 1.15; // Suboptimal slows 15%
  } else {
    adjustmentFactor = 1.30; // Poor conditions slow 30%
  }
  
  // Apply climate anomalies if real data is available
  if (realClimateData?.anomalies) {
    const { drought, heatWave, flood } = realClimateData.anomalies;
    
    if (drought) {
      adjustmentFactor += 0.10; // Drought adds 10% time
      console.log('📊 Drought detected, adding 10% to production time');
    }
    
    if (heatWave) {
      adjustmentFactor += 0.08; // Heat wave adds 8% time
      console.log('📊 Heat wave detected, adding 8% to production time');
    }
    
    if (flood) {
      adjustmentFactor += 0.12; // Flood adds 12% time
      console.log('📊 Flood risk detected, adding 12% to production time');
    }
  }
  
  // Apply evapotranspiration factor if available
  if (realClimateData?.evapotranspiration !== undefined) {
    // High ET (>6) can stress plants in low water conditions
    if (realClimateData.evapotranspiration > 6 && crop.waterConsumption === 'high') {
      adjustmentFactor += 0.05;
      console.log('📊 High evapotranspiration stress, adding 5% to production time');
    }
  }
  
  // Cap adjustment factor to reasonable limits
  adjustmentFactor = Math.min(Math.max(adjustmentFactor, 0.85), 1.50);
  
  const adjustedDays = Math.round(baseDays * adjustmentFactor);
  const estimatedWeeks = Math.round(adjustedDays / 7);
  const estimatedMonths = Math.round(adjustedDays / 30);
  
  // Determine speed category
  let speed: 'fast' | 'normal' | 'slow';
  let explanation: { pt: string; en: string };
  
  if (adjustmentFactor <= 0.95) {
    speed = 'fast';
    explanation = {
      pt: 'Condições ideais aceleram o crescimento',
      en: 'Ideal conditions accelerate growth'
    };
  } else if (adjustmentFactor >= 1.15) {
    speed = 'slow';
    explanation = {
      pt: 'Condições adversas podem prolongar o ciclo',
      en: 'Adverse conditions may extend the cycle'
    };
  } else {
    speed = 'normal';
    explanation = {
      pt: 'Tempo de crescimento esperado normal',
      en: 'Normal expected growth time'
    };
  }
  
  return {
    baseDays,
    adjustedDays,
    adjustmentFactor,
    estimatedWeeks,
    estimatedMonths,
    speed,
    explanation
  };
};
