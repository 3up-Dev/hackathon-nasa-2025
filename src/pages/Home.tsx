import { useNavigate } from 'react-router-dom';
import { GameLayout } from '@/components/layout/GameLayout';
import { PixelButton } from '@/components/layout/PixelButton';
import { useLanguage } from '@/hooks/useLanguage';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <GameLayout>
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-game-bg to-game-green-400 to-opacity-20 p-8">
        {/* Logo */}
        <div className="mb-8 animate-fade-in">
          <div className="text-8xl mb-4 animate-pulse">🌱</div>
          <h1 className="font-pixel text-lg text-game-fg text-center leading-relaxed px-4">
            {t('app_title')}
          </h1>
        </div>

        {/* Decorative elements */}
        <div className="flex gap-4 mb-12 text-5xl opacity-70">
          <span className="animate-bounce delay-0">🌾</span>
          <span className="animate-bounce delay-100">🌽</span>
          <span className="animate-bounce delay-200">🌿</span>
        </div>

        {/* CTAs */}
        <div className="w-full max-w-xs space-y-4">
          <PixelButton
            variant="primary"
            size="lg"
            onClick={() => navigate('/select-country')}
            className="w-full"
          >
            {t('cta_start')}
          </PixelButton>
          <PixelButton
            variant="secondary"
            size="lg"
            onClick={() => navigate('/game')}
            className="w-full"
          >
            {t('cta_howto')}
          </PixelButton>
        </div>

        {/* Footer decoration */}
        <div className="absolute bottom-8 text-xs font-sans text-game-gray-700 opacity-50">
          Hackathon NASA 2025
        </div>
      </div>
    </GameLayout>
  );
}
