/**
 * Este arquivo foi desenvolvido com assistência de Inteligência Artificial.
 * Toda a lógica, estrutura e implementação foram revisadas e validadas pela equipe humana.
 * 
 * This file was developed with Artificial Intelligence assistance.
 * All logic, structure, and implementation were reviewed and validated by the human team.
 */

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'default' | 'lg';
}

export const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ className, variant = 'primary', size = 'default', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'font-pixel text-xs transition-all duration-100 active:scale-95',
          'disabled:opacity-50 disabled:pointer-events-none',
          'focus:outline-none focus:ring-2 focus:ring-game-green-400 focus:ring-offset-2',
          {
            'bg-game-green-700 text-white hover:bg-game-green-400 shadow-lg':
              variant === 'primary',
            'bg-game-brown text-white hover:bg-opacity-90 shadow-lg':
              variant === 'secondary',
            'bg-transparent text-game-fg hover:bg-game-gray-300':
              variant === 'ghost',
            'h-12 px-6 rounded-lg': size === 'default',
            'h-14 px-8 rounded-xl text-sm': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

PixelButton.displayName = 'PixelButton';
