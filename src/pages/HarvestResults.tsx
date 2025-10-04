import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GameLayout } from '@/components/layout/GameLayout';
import { PixelButton } from '@/components/layout/PixelButton';
import { MedalBadge } from '@/components/game/MedalBadge';
import { IndicatorCard } from '@/components/game/IndicatorCard';
import { useLanguage } from '@/hooks/useLanguage';
import { useProductionCycle } from '@/hooks/useProductionCycle';
import { useGameState } from '@/hooks/useGameState';
import { crops, Crop } from '@/data/crops';
import { brazilStates, BrazilState } from '@/data/states';
import { getMedalType } from '@/data/gameLogic';
import { Trophy, TrendingUp } from 'lucide-react';

export default function HarvestResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, lang } = useLanguage();
  const [crop, setCrop] = useState<Crop | null>(null);
  const [state, setState] = useState<BrazilState | null>(null);

  const { health, sustainabilityScore, waterUsed, resetProduction } = useProductionCycle();
  const { addPlanting } = useGameState();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cropId = params.get('crop');
    const stateId = params.get('state');

    if (!cropId || !stateId) {
      navigate('/game');
      return;
    }

    const selectedCrop = crops.find(c => c.id === cropId);
    const selectedState = brazilStates.find(s => s.id === stateId);

    if (!selectedCrop || !selectedState) {
      navigate('/game');
      return;
    }

    setCrop(selectedCrop);
    setState(selectedState);
  }, [location, navigate]);

  if (!crop || !state) {
    return null;
  }

  // Calcular pontuação final
  const productionScore = health;
  const waterEfficiency = Math.max(0, 100 - (waterUsed / 100));
  
  const finalScore = Math.round(
    productionScore * 0.4 +
    sustainabilityScore * 0.4 +
    waterEfficiency * 0.2
  );

  const medal = getMedalType(finalScore);

  // Calcular quantidade produzida (baseado na saúde)
  const baseProduction = crop.waterConsumption === 'high' ? 5000 : 
                         crop.waterConsumption === 'medium' ? 3000 : 2000;
  const productionAmount = Math.round((baseProduction * health) / 100);

  // Calcular qualidade
  const quality = finalScore >= 80 ? 'A' : finalScore >= 60 ? 'B' : 'C';

  // Lucro simulado
  const pricePerUnit = crop.waterConsumption === 'high' ? 2.5 : 
                       crop.waterConsumption === 'medium' ? 3.0 : 3.5;
  const profit = Math.round(productionAmount * pricePerUnit * (quality === 'A' ? 1.2 : quality === 'B' ? 1.0 : 0.8));

  const handleContinue = () => {
    // Adicionar ao estado global do jogo
    addPlanting(state.id, {
      production: Math.round(productionScore / 10),
      sustainability: Math.round(sustainabilityScore / 10),
      water: Math.round(waterEfficiency / 10),
    });

    // Resetar produção
    resetProduction();

    // Navegar para o mapa
    navigate('/game');
  };

  const handleViewResults = () => {
    navigate('/results');
  };

  return (
    <GameLayout>
      <div className="w-full max-w-3xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-game-bg border-4 border-game-fg rounded-xl p-6 text-center">
          <div className="text-6xl mb-4">{crop.icon}</div>
          <h2 className="font-pixel text-xl text-game-fg mb-2">
            {lang === 'pt' ? 'Colheita Realizada!' : 'Harvest Complete!'}
          </h2>
          <p className="font-sans text-sm text-game-gray-700">
            {crop.name[lang]} - {state.name}
          </p>
        </div>

        {/* Medalha */}
        <div className="bg-game-bg border-4 border-game-fg rounded-xl p-8">
          <MedalBadge type={medal} />
          <div className="mt-6 text-center">
            <p className="font-pixel text-xs text-game-gray-700 mb-2">{t('score_final')}</p>
            <p className="font-pixel text-5xl text-game-fg">{finalScore}</p>
          </div>
        </div>

        {/* Resultados da Produção */}
        <div className="bg-game-bg border-4 border-game-fg rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-game-gold" />
            <h3 className="font-pixel text-base text-game-fg">
              {lang === 'pt' ? 'Resultados da Produção' : 'Production Results'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-game-gray-200 border-2 border-game-fg rounded-lg p-4">
              <p className="font-pixel text-xs text-game-gray-700 mb-2">
                {lang === 'pt' ? 'Quantidade Produzida' : 'Amount Produced'}
              </p>
              <p className="font-pixel text-2xl text-game-fg">{productionAmount.toLocaleString()}</p>
              <p className="font-sans text-xs text-game-gray-600 mt-1">
                {lang === 'pt' ? 'kg/toneladas' : 'kg/tons'}
              </p>
            </div>

            <div className="bg-game-gray-200 border-2 border-game-fg rounded-lg p-4">
              <p className="font-pixel text-xs text-game-gray-700 mb-2">
                {lang === 'pt' ? 'Qualidade' : 'Quality'}
              </p>
              <p className="font-pixel text-2xl text-game-fg">{quality}</p>
              <p className="font-sans text-xs text-game-gray-600 mt-1">
                {quality === 'A' ? (lang === 'pt' ? 'Excelente' : 'Excellent') :
                 quality === 'B' ? (lang === 'pt' ? 'Bom' : 'Good') :
                 (lang === 'pt' ? 'Regular' : 'Fair')}
              </p>
            </div>

            <div className="bg-game-gray-200 border-2 border-game-fg rounded-lg p-4 md:col-span-2">
              <p className="font-pixel text-xs text-game-gray-700 mb-2">
                {lang === 'pt' ? 'Lucro Estimado' : 'Estimated Profit'}
              </p>
              <p className="font-pixel text-3xl text-game-green-700">
                R$ {profit.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Indicadores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <IndicatorCard
            icon="🌾"
            label={t('prod_total')}
            value={productionScore}
            color="green"
          />
          <IndicatorCard
            icon="🌱"
            label={t('sustentabilidade')}
            value={sustainabilityScore}
            color="green"
          />
          <IndicatorCard
            icon="💧"
            label={lang === 'pt' ? 'Eficiência Hídrica' : 'Water Efficiency'}
            value={waterEfficiency}
            color="blue"
          />
        </div>

        {/* Conquistas */}
        <div className="bg-game-bg border-4 border-game-fg rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-game-green-700" />
            <h3 className="font-pixel text-base text-game-fg">
              {lang === 'pt' ? 'Conquistas' : 'Achievements'}
            </h3>
          </div>

          <div className="space-y-2">
            {waterEfficiency >= 80 && (
              <div className="flex items-center gap-3 p-3 bg-game-green-400/20 border-2 border-game-green-700 rounded-lg">
                <span className="text-2xl">💧</span>
                <div>
                  <p className="font-pixel text-xs text-game-fg">
                    {lang === 'pt' ? 'Agricultor Eficiente' : 'Efficient Farmer'}
                  </p>
                  <p className="font-sans text-xs text-game-gray-700">
                    {lang === 'pt' ? 'Usou água com eficiência' : 'Used water efficiently'}
                  </p>
                </div>
              </div>
            )}

            {sustainabilityScore >= 90 && (
              <div className="flex items-center gap-3 p-3 bg-game-green-400/20 border-2 border-game-green-700 rounded-lg">
                <span className="text-2xl">🌱</span>
                <div>
                  <p className="font-pixel text-xs text-game-fg">
                    {lang === 'pt' ? 'Produtor Sustentável' : 'Sustainable Producer'}
                  </p>
                  <p className="font-sans text-xs text-game-gray-700">
                    {lang === 'pt' ? 'Alta sustentabilidade' : 'High sustainability'}
                  </p>
                </div>
              </div>
            )}

            {health >= 95 && (
              <div className="flex items-center gap-3 p-3 bg-game-green-400/20 border-2 border-game-green-700 rounded-lg">
                <span className="text-2xl">⭐</span>
                <div>
                  <p className="font-pixel text-xs text-game-fg">
                    {lang === 'pt' ? 'Mestre Agrícola' : 'Agricultural Master'}
                  </p>
                  <p className="font-sans text-xs text-game-gray-700">
                    {lang === 'pt' ? 'Saúde perfeita da produção' : 'Perfect production health'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-4">
          <PixelButton
            variant="primary"
            size="lg"
            onClick={handleContinue}
            className="w-full"
          >
            {lang === 'pt' ? 'Continuar Jogando' : 'Continue Playing'}
          </PixelButton>
          <PixelButton
            variant="secondary"
            onClick={handleViewResults}
            className="w-full"
          >
            {lang === 'pt' ? 'Ver Resultados Globais' : 'View Global Results'}
          </PixelButton>
        </div>
      </div>
    </GameLayout>
  );
}
