import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameLayout } from '@/components/layout/GameLayout';
import { PixelButton } from '@/components/layout/PixelButton';
import { TutorialSlide } from '@/components/tutorial/TutorialSlide';
import { useLanguage } from '@/hooks/useLanguage';

export default function Tutorial() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const slides = [
    {
      icon: '🌡️',
      title: t('tut_1_title'),
      body: t('tut_1_body'),
    },
    {
      icon: '🌱',
      title: t('tut_2_title'),
      body: t('tut_2_body'),
    },
    {
      icon: '📊',
      title: t('tut_3_title'),
      body: t('tut_3_body'),
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate('/select-country');
    }
  };

  const handleSkip = () => {
    navigate('/select-country');
  };

  return (
    <GameLayout>
      <div className="relative h-full bg-game-bg">
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 font-sans text-sm text-game-gray-700 hover:text-game-fg z-10"
        >
          {t('cta_skip')}
        </button>

        {/* Slide */}
        <TutorialSlide {...slides[currentSlide]} />

        {/* Indicators */}
        <div className="absolute bottom-32 left-0 right-0 flex justify-center gap-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? 'bg-game-green-700 w-6' : 'bg-game-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="absolute bottom-8 left-8 right-8 flex gap-4">
          <PixelButton
            variant="secondary"
            onClick={() => currentSlide === 0 ? navigate('/select-country') : setCurrentSlide(currentSlide - 1)}
            className="w-20"
          >
            ←
          </PixelButton>
          <PixelButton variant="primary" onClick={handleNext} className="flex-1">
            {currentSlide === slides.length - 1 ? t('cta_start') : t('cta_next')}
          </PixelButton>
        </div>
      </div>
    </GameLayout>
  );
}
