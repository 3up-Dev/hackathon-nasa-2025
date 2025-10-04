import * as React from 'react';
import { useEffect, useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
import { GameLayout } from '@/components/layout/GameLayout';
import { PixelButton } from '@/components/layout/PixelButton';
import { useLanguage } from '@/hooks/useLanguage';
import { crops, Crop } from '@/data/crops';
import { brazilStates, BrazilState } from '@/data/states';
import { useClimateData } from '@/hooks/useClimateData';
import { calculateViability } from '@/data/gameLogic';
import { Loader2, Thermometer, Droplets, Mountain, Clock, Satellite } from 'lucide-react';

export default function PrePlantingEducation() {
  // const navigate = useNavigate();
  // const location = useLocation();
  const { t, lang } = useLanguage();
  const [crop, setCrop] = useState<Crop | null>(null);
  const [state, setState] = useState<BrazilState | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cropId = params.get('crop');
    const stateId = params.get('state');

    if (!cropId || !stateId) {
      window.location.href = '/game';
      return;
    }

    const selectedCrop = crops.find(c => c.id === cropId);
    const selectedState = brazilStates.find(s => s.id === stateId);

    if (!selectedCrop || !selectedState) {
      window.location.href = '/game';
      return;
    }

    setCrop(selectedCrop);
    setState(selectedState);
  }, []);

  const { data: climateData, loading: loadingClimate } = useClimateData(state!, !!state);

  if (!crop || !state) {
    return null;
  }

  const viability = calculateViability(crop, state, climateData);
  const compatibilityScore = Math.round(viability.isViable ? 85 : 45);

  const handleStartProduction = () => {
    if (!crop || !state) return;
    window.location.href = `/production?crop=${crop.id}&state=${state.id}`;
  };

  return (
    <GameLayout>
      <div className="w-full max-w-3xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-game-bg border-4 border-game-fg rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">{crop.icon}</div>
            <div>
              <h2 className="font-pixel text-lg text-game-fg">{crop.name[lang]}</h2>
              <p className="font-sans text-sm text-game-gray-700">{state.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <div className={`px-4 py-2 rounded-lg ${viability.isViable ? 'bg-game-green-700' : 'bg-game-brown'}`}>
              <span className="font-pixel text-xs text-white">
                {(viability.isViable 
                  ? (lang === 'pt' ? `Local viável para ${crop.name[lang]}!` : `Viable location for ${crop.name[lang]}!`)
                  : (lang === 'pt' ? `Local não ideal para ${crop.name[lang]}.` : `Not ideal for ${crop.name[lang]}.`)
                )}
              </span>
            </div>
          </div>

          <div className="bg-game-green-400/20 border-2 border-game-green-700 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-pixel text-xs text-game-fg">Compatibilidade</span>
              <span className="font-pixel text-xl text-game-green-700">{compatibilityScore}%</span>
            </div>
            <div className="w-full bg-game-gray-300 h-2 rounded-full mt-2">
              <div 
                className="bg-game-green-700 h-2 rounded-full transition-all duration-500"
                style={{ width: `${compatibilityScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Dados Climáticos */}
        <div className="bg-game-bg border-4 border-game-fg rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-pixel text-base text-game-fg">
              {lang === 'pt' ? 'Dados Climáticos' : 'Climate Data'}
            </h3>
            {viability.isRealData && !loadingClimate && (
              <div className="flex items-center gap-1 px-2 py-1 bg-game-green-700 rounded">
                <Satellite className="w-3 h-3 text-white" />
                <span className="font-pixel text-xs text-white">NASA</span>
              </div>
            )}
          </div>

          {loadingClimate ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-game-green-700" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-game-gray-200 border-2 border-game-fg rounded-lg p-4">
                <Thermometer className="w-6 h-6 text-game-brown mb-2" />
                <p className="font-sans text-xs text-game-gray-700 mb-1">{t('popup_temp')}</p>
                <p className="font-pixel text-lg text-game-fg">
                  {climateData?.temperature ?? state.temp}°C
                </p>
                <p className="font-sans text-xs text-game-gray-600 mt-1">
                  {lang === 'pt' ? 'Ideal' : 'Ideal'}: {crop.idealTemp[0]}-{crop.idealTemp[1]}°C
                </p>
              </div>

              <div className="bg-game-gray-200 border-2 border-game-fg rounded-lg p-4">
                <Droplets className="w-6 h-6 text-game-green-700 mb-2" />
                <p className="font-sans text-xs text-game-gray-700 mb-1">{t('popup_rain')}</p>
                <p className="font-pixel text-lg text-game-fg">
                  {climateData?.precipitation ?? state.rain}mm
                </p>
                <p className="font-sans text-xs text-game-gray-600 mt-1">
                  {lang === 'pt' ? 'Ideal' : 'Ideal'}: {crop.idealRain[0]}-{crop.idealRain[1]}mm
                </p>
              </div>

              <div className="bg-game-gray-200 border-2 border-game-fg rounded-lg p-4">
                <Mountain className="w-6 h-6 text-game-brown mb-2" />
                <p className="font-sans text-xs text-game-gray-700 mb-1">{t('popup_soil')}</p>
                <p className="font-pixel text-sm text-game-fg capitalize">{state.soil}</p>
                <p className="font-sans text-xs text-game-gray-600 mt-1">
                  {crop.idealSoil.includes(state.soil) ? '✓ ' : '✗ '}
                  {lang === 'pt' ? 'Adequado' : 'Suitable'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Informações da Cultura */}
        <div className="bg-game-bg border-4 border-game-fg rounded-xl p-6">
          <h3 className="font-pixel text-base text-game-fg mb-4">
            {lang === 'pt' ? 'Sobre a Cultura' : 'About the Crop'}
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-game-green-700 mt-1" />
              <div>
                <p className="font-pixel text-xs text-game-fg">
                  {lang === 'pt' ? 'Tempo até colheita' : 'Time to harvest'}
                </p>
                <p className="font-sans text-sm text-game-gray-700">
                  {crop.growthDays} {lang === 'pt' ? 'dias' : 'days'} 
                  {crop.growthDays >= 365 && ` (${Math.floor(crop.growthDays / 365)} ${lang === 'pt' ? 'anos' : 'years'})`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Droplets className="w-5 h-5 text-game-green-700 mt-1" />
              <div>
                <p className="font-pixel text-xs text-game-fg">
                  {lang === 'pt' ? 'Consumo de água' : 'Water consumption'}
                </p>
                <p className="font-sans text-sm text-game-gray-700 capitalize">
                  {lang === 'pt' 
                    ? crop.waterConsumption === 'high' ? 'Alto' : crop.waterConsumption === 'medium' ? 'Médio' : 'Baixo'
                    : crop.waterConsumption}
                </p>
              </div>
            </div>

            <div className="bg-game-green-400/20 border-2 border-game-green-700 rounded-lg p-3 mt-4">
              <p className="font-pixel text-xs text-game-fg mb-2">
                {lang === 'pt' ? 'Etapas de Crescimento' : 'Growth Stages'}
              </p>
              <div className="space-y-1">
                {crop.stages.map((stage, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="font-sans text-xs text-game-gray-700">
                      {index + 1}. {stage.name[lang]} ({stage.daysToComplete} {lang === 'pt' ? 'dias' : 'days'})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Avisos */}
        {!viability.isViable && viability.reasons.length > 0 && (
          <div className="bg-game-brown/20 border-2 border-game-brown rounded-lg p-4">
            <p className="font-pixel text-xs text-game-brown mb-2">
              {lang === 'pt' ? '⚠️ Desafios Identificados' : '⚠️ Identified Challenges'}
            </p>
            <ul className="space-y-1">
              {viability.reasons.map((reason, i) => (
                <li key={i} className="font-sans text-xs text-game-gray-700">• {reason}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Ação */}
        <div className="flex gap-4">
          <PixelButton
            variant="ghost"
            onClick={() => (window.location.href = '/game')}
            className="flex-1"
          >
            {t('cta_close')}
          </PixelButton>
          <PixelButton
            variant="primary"
            size="lg"
            onClick={handleStartProduction}
            className="flex-1"
          >
            {lang === 'pt' ? 'Começar Produção!' : 'Start Production!'}
          </PixelButton>
        </div>
      </div>
    </GameLayout>
  );
}
