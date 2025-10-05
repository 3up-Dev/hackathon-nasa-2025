/**
 * Este arquivo foi desenvolvido com assistência de Inteligência Artificial.
 * Toda a lógica, estrutura e implementação foram revisadas e validadas pela equipe humana.
 * 
 * This file was developed with Artificial Intelligence assistance.
 * All logic, structure, and implementation were reviewed and validated by the human team.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, Trophy } from 'lucide-react';
import { GameLayout } from '@/components/layout/GameLayout';
import { PixelButton } from '@/components/layout/PixelButton';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { UserStatsCard } from '@/components/profile/UserStatsCard';
import { useGameProfiles } from '@/hooks/useGameProfiles';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageToggle } from '@/components/layout/LanguageToggle';

export default function ProfileManager() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { profiles, loading, loadProfiles, setActiveProfile, deleteProfile } = useGameProfiles();
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handlePlayProfile = async (profileId: string) => {
    await setActiveProfile(profileId);
    
    // Buscar dados do perfil para navegação
    const profile = profiles.find(p => p.id === profileId);
    const status = (profile as any)?.status || 'active';
    
    // Se o perfil está concluído, mostrar resultados da colheita
    if (status === 'completed' && profile?.crop_id && profile?.state_id) {
      navigate(`/harvest?crop=${profile.crop_id}&state=${profile.state_id}`);
      return;
    }
    
    if (profile && profile.crop_id && profile.state_id) {
      // Navegar para a tela de produção com os parâmetros corretos
      navigate(`/production?crop=${profile.crop_id}&state=${profile.state_id}`);
    } else {
      console.error('Profile missing crop_id or state_id:', profile);
      // Fallback: tentar navegar apenas com o que temos
      if (profile?.crop_id) {
        navigate(`/production?crop=${profile.crop_id}&state=AM`);
      }
    }
  };

  const handleCreateProfile = () => {
    navigate('/profile/new');
  };

  const handleViewResults = () => {
    navigate('/results');
  };

  // Filtrar perfis baseado no status
  const filteredProfiles = useMemo(() => {
    return profiles.filter(profile => {
      const status = (profile as any).status || 'active';
      return showCompleted ? status === 'completed' : status === 'active';
    });
  }, [profiles, showCompleted]);

  // Calcular estatísticas do usuário
  const userStats = useMemo(() => {
    if (profiles.length === 0) {
      return { totalScore: 0, profilesCount: 0, bestScore: 0 };
    }

    const totalScore = profiles.reduce((sum, profile) => sum + (profile.total_score || 0), 0);
    const bestScore = Math.max(...profiles.map(p => p.total_score || 0));

    return {
      totalScore,
      profilesCount: profiles.length,
      bestScore,
    };
  }, [profiles]);

  if (loading) {
    return (
      <GameLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-4xl animate-pulse">🌱</div>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout>
      <div className="h-full flex flex-col p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="font-pixel text-sm text-game-fg">
            🌱 {t('profiles_title')}
          </h1>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <button
              onClick={handleLogout}
              className="text-game-gray-700 hover:text-game-fg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Card de Estatísticas do Usuário */}
        {profiles.length > 0 && (
          <UserStatsCard
            totalScore={userStats.totalScore}
            profilesCount={userStats.profilesCount}
            bestScore={userStats.bestScore}
          />
        )}

        {/* Toggle para mostrar perfis concluídos */}
        {profiles.length > 0 && (
          <PixelButton 
            variant="ghost"
            onClick={() => setShowCompleted(!showCompleted)}
            className="w-full flex items-center justify-center gap-2 mb-4"
          >
            {showCompleted ? t('profiles_hide_completed') : t('profiles_show_completed')}
          </PixelButton>
        )}

        {filteredProfiles.length === 0 && profiles.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="flex gap-4 mb-4 text-4xl opacity-70 justify-center">
              <span className="animate-bounce delay-0">🌾</span>
              <span className="animate-bounce delay-100">🌽</span>
              <span className="animate-bounce delay-200">🌿</span>
              <span className="animate-bounce delay-300">🐄</span>
              <span className="animate-bounce delay-0">🐟</span>
            </div>
            <h2 className="font-pixel text-sm text-game-fg mb-2">
              {t('profiles_none')}
            </h2>
            <p className="font-sans text-sm text-game-gray-700 mb-6 max-w-xs">
              {t('profiles_create_first')}
            </p>
            <PixelButton onClick={handleCreateProfile} className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {t('profiles_create_button')}
            </PixelButton>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="text-4xl mb-4 opacity-70">📦</div>
            <h2 className="font-pixel text-sm text-game-fg mb-2">
              {showCompleted ? 'Nenhum perfil concluído' : 'Nenhum perfil ativo'}
            </h2>
            <p className="font-sans text-sm text-game-gray-700 mb-6 max-w-xs">
              {showCompleted 
                ? 'Complete produções para vê-las aqui!' 
                : 'Crie um novo perfil para começar!'}
            </p>
          </div>
        ) : (
          <>
            <PixelButton 
              variant="ghost"
              onClick={handleViewResults}
              className="w-full flex items-center justify-center gap-2 mb-4"
            >
              <Trophy className="w-5 h-5" />
              {t('profiles_view_results')}
            </PixelButton>

            <div className="grid gap-4 mb-6">
              {filteredProfiles.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  onPlay={() => handlePlayProfile(profile.id)}
                  onDelete={() => deleteProfile(profile.id)}
                />
              ))}
            </div>

            <div className="space-y-3">
              <PixelButton 
                onClick={handleCreateProfile}
                className="w-full flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {t('profiles_new_button')}
              </PixelButton>
            </div>
          </>
        )}
      </div>
    </GameLayout>
  );
}
