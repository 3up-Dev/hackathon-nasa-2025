import { ReactNode } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

interface GameLayoutProps {
  children: ReactNode;
}

export const GameLayout = ({ children }: GameLayoutProps) => {
  const { lang, toggleLanguage } = useLanguage();

  return (
    <div className="fixed inset-0 bg-game-bg overflow-hidden">
      {/* Decorative background pattern - apenas em desktop */}
      <div className="hidden md:block absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl">🌱</div>
        <div className="absolute top-20 right-20 text-5xl">🌾</div>
        <div className="absolute bottom-20 left-20 text-5xl">🌿</div>
        <div className="absolute bottom-10 right-10 text-6xl">🌽</div>
      </div>

      {/* Game container - Responsivo para mobile, centralizado em desktop */}
      <div className="relative h-full w-full md:max-w-[430px] md:h-[932px] md:mx-auto md:my-4 md:rounded-2xl bg-white md:shadow-2xl overflow-hidden flex flex-col">
        
        {/* Language toggle - dentro do container */}
        <button
          onClick={toggleLanguage}
          className="absolute top-4 right-4 z-50 w-10 h-10 md:w-12 md:h-12 rounded-lg bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-lg md:text-xl hover:scale-110 transition-transform"
          aria-label="Toggle language"
          style={{ 
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          {lang === 'pt' ? '🇧🇷' : '🇺🇸'}
        </button>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
