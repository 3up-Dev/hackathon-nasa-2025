/**
 * Este arquivo foi desenvolvido com assistência de Inteligência Artificial.
 * Toda a lógica, estrutura e implementação foram revisadas e validadas pela equipe humana.
 * 
 * This file was developed with Artificial Intelligence assistance.
 * All logic, structure, and implementation were reviewed and validated by the human team.
 */

import { ReactNode } from 'react';

interface GameLayoutProps {
  children: ReactNode;
}

export const GameLayout = ({ children }: GameLayoutProps) => {
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
        {/* Content */}
        <div className="flex-1 overflow-auto z-10 pointer-events-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
