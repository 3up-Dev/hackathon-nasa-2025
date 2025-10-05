/**
 * Este arquivo foi desenvolvido com assistência de Inteligência Artificial.
 * Toda a lógica, estrutura e implementação foram revisadas e validadas pela equipe humana.
 * 
 * This file was developed with Artificial Intelligence assistance.
 * All logic, structure, and implementation were reviewed and validated by the human team.
 */

import { Globe } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const LanguageToggle = () => {
  const { lang, toggleLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all hover:scale-105 border-2 border-game-gray-300">
        <Globe className="w-4 h-4 text-game-fg" />
        <span className="font-pixel text-xs text-game-fg uppercase">
          {lang}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        <DropdownMenuItem
          onClick={toggleLanguage}
          className="cursor-pointer font-sans text-sm"
        >
          <span className="mr-2">🇧🇷</span>
          Português
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={toggleLanguage}
          className="cursor-pointer font-sans text-sm"
        >
          <span className="mr-2">🇺🇸</span>
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
