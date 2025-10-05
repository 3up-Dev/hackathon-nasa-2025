/**
 * Este arquivo foi desenvolvido com assistência de Inteligência Artificial.
 * Toda a lógica, estrutura e implementação foram revisadas e validadas pela equipe humana.
 * 
 * This file was developed with Artificial Intelligence assistance.
 * All logic, structure, and implementation were reviewed and validated by the human team.
 */

import { useState } from 'react';
import { Trash2, Play } from 'lucide-react';
import { crops } from '@/data/crops';
import { states } from '@/data/states';
import { useLanguage } from '@/hooks/useLanguage';
import { PixelButton } from '@/components/layout/PixelButton';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ProfileCardProps {
  profile: {
    id: string;
    profile_name: string;
    crop_id: string;
    sector: string;
    state_id: string;
    total_score: number;
    planted_states: string[];
    is_active: boolean;
    status?: string;
    last_played_at: string;
    production_state?: any;
  };
  onPlay: () => void;
  onDelete: () => void;
}

export const ProfileCard = ({ profile, onPlay, onDelete }: ProfileCardProps) => {
  const { t, lang } = useLanguage();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const crop = crops.find(c => c.id === profile.crop_id);
  const state = states.find(s => s.id === profile.state_id);
  const status = profile.status || 'active';
  const isCompleted = status === 'completed';
  
  // Check if there's production data
  const productionState = profile.production_state as any;
  const hasProductionData = productionState && productionState.currentDay !== undefined && crop;
  
  // Calculate progress based ONLY on production days
  const progress = hasProductionData
    ? Math.min((productionState.currentDay / crop.growthDays) * 100, 100)
    : 0;
  
  const progressLabel = hasProductionData
    ? `${productionState.currentDay}/${crop.growthDays} dias`
    : '0 dias';
  
  const formatDate = (date: string) => {
    const now = new Date();
    const lastPlayed = new Date(date);
    const diffMs = now.getTime() - lastPlayed.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `há ${diffMins}min`;
    if (diffHours < 24) return `há ${diffHours}h`;
    return `há ${diffDays}d`;
  };

  return (
    <div className={`
      bg-white border-4 border-game-fg rounded-xl p-6 
      transition-all hover:shadow-xl
      ${profile.is_active ? 'ring-4 ring-game-green-400' : ''}
    `}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{crop?.icon || '🌱'}</span>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-pixel text-xs text-game-fg">{profile.profile_name}</span>
              <span className={cn(
                "px-2 py-0.5 font-pixel text-[8px] rounded",
                isCompleted 
                  ? "bg-game-gold text-white" 
                  : "bg-game-green-700 text-white"
              )}>
                {isCompleted ? t('profiles_status_completed') : t('profiles_status_active')}
              </span>
            </div>
            <p className="font-sans text-xs text-game-gray-700">
              {crop?.name[lang]} • {state?.name}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="font-sans text-xs text-game-gray-700">
            Progresso da Produção
          </span>
          <span className="font-pixel text-xs text-game-fg">
            {progressLabel}
          </span>
        </div>
        <div className="w-full bg-game-gray-200 rounded-full h-2">
          <div 
            className="bg-game-green-400 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="font-sans text-xs text-game-gray-700">
          Pontuação: <span className="font-bold text-game-fg">{profile.total_score}</span>
        </span>
        <span className="font-sans text-xs text-game-gray-700">
          Produção: <span className="font-bold text-game-fg">{profile.planted_states.length} estado{profile.planted_states.length !== 1 ? 's' : ''}</span>
        </span>
      </div>

      <div className="flex gap-2">
        <PixelButton
          onClick={onPlay}
          className="flex-1 flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" />
          {isCompleted ? t('profiles_button_details') : t('profiles_button_continue')}
        </PixelButton>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="
              bg-red-500 hover:bg-red-600 text-white
              border-4 border-game-fg rounded-lg p-2
              transition-all hover:scale-105
            ">
              <Trash2 className="w-4 h-4" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deletar Perfil?</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja deletar o perfil "{profile.profile_name}"? 
                Esta ação não pode ser desfeita e todo o progresso será perdido.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} className="bg-red-500 hover:bg-red-600">
                Deletar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
