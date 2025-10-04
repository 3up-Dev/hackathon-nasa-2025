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

  // Temperature check
  if (temp < crop.idealTemp[0]) {
    isViable = false;
    reasons.push('reason_low_temp');
  } else if (temp > crop.idealTemp[1]) {
    isViable = false;
    reasons.push('reason_high_temp');
  }

  // Rainfall check
  if (rain < crop.idealRain[0]) {
    isViable = false;
    reasons.push('reason_low_rain');
  }

  // Soil check
  if (!crop.idealSoil.includes(state.soil)) {
    isViable = false;
    reasons.push('reason_bad_soil');
  }

  // Calculate scores based on viability
  const scores = {
    production: isViable ? 15 : 5,
    sustainability: isViable ? 10 : 2,
    water: crop.waterConsumption === 'high' ? 8 : crop.waterConsumption === 'medium' ? 5 : 3,
  };

  return {
    isViable,
    reasons: reasons.slice(0, 2), // Max 2 reasons
    suggestedStates: [], // Will be filled by hook
    scores,
    isRealData,
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
