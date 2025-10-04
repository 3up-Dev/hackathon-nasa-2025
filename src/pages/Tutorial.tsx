import { useState } from 'react';
import { GameLayout } from '@/components/layout/GameLayout';
import { PixelButton } from '@/components/layout/PixelButton';
import { TutorialSlide } from '@/components/tutorial/TutorialSlide';
import { supabase } from '@/integrations/supabase/client';

export default function Tutorial() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { icon: '🌡️', title: 'Clima e Solo', body: 'Aprenda como clima e solo afetam sua produção.' },
    { icon: '🌱', title: 'Ciclo da Plantação', body: 'Gerencie etapas do plantio até a colheita.' },
    { icon: '📊', title: 'Indicadores e Progresso', body: 'Acompanhe métricas para tomar melhores decisões.' },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      localStorage.setItem('tutorialCompleted', '1');
      window.location.href = '/select-country';
    }
  };

  const handleSkip = () => {
    localStorage.setItem('tutorialCompleted', '1');
    window.location.href = '/select-country';
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <GameLayout>
      <div className="relative h-full bg-game-bg">
        {/* Header buttons */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <button
            onClick={handleLogout}
            className="font-sans text-sm text-game-gray-700 hover:text-game-fg"
          >
            ← Sair
          </button>
          <button
            onClick={handleSkip}
            className="font-sans text-sm text-game-gray-700 hover:text-game-fg"
          >
            Pular
          </button>
        </div>

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
            onClick={() => {
              if (currentSlide === 0) {
                window.location.href = '/select-country';
              } else {
                setCurrentSlide(currentSlide - 1);
              }
            }}
            className="w-20"
          >
            ←
          </PixelButton
          >
          <PixelButton variant="primary" onClick={handleNext} className="flex-1">
            {currentSlide === slides.length - 1 ? 'Começar' : 'Próximo'}
          </PixelButton>
        </div>
      </div>
    </GameLayout>
  );
}
