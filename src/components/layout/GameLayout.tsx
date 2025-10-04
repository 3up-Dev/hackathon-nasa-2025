import { ReactNode } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

interface GameLayoutProps {
  children: ReactNode;
}

export const GameLayout = ({ children }: GameLayoutProps) => {
  const { lang, toggleLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-game-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl">🌱</div>
        <div className="absolute top-20 right-20 text-5xl">🌾</div>
        <div className="absolute bottom-20 left-20 text-5xl">🌿</div>
        <div className="absolute bottom-10 right-10 text-6xl">🌽</div>
      </div>

      {/* Language toggle */}
      <button
        onClick={toggleLanguage}
        className="absolute top-4 right-4 z-50 w-12 h-12 rounded-lg bg-white shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform"
        aria-label="Toggle language"
      >
        {lang === 'pt' ? '🇧🇷' : '🇺🇸'}
      </button>

      {/* Game container - Fixed mobile size */}
      <div className="relative w-full max-w-[390px] h-[844px] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {children}
      </div>
    </div>
  );
};
