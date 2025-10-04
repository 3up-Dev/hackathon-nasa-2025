import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut } from 'lucide-react';
import { GameLayout } from '@/components/layout/GameLayout';
import { PixelButton } from '@/components/layout/PixelButton';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { useGameProfiles } from '@/hooks/useGameProfiles';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/hooks/useLanguage';

export default function ProfileManager() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { profiles, loading, loadProfiles, setActiveProfile, deleteProfile } = useGameProfiles();

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handlePlayProfile = async (profileId: string) => {
    await setActiveProfile(profileId);
    navigate('/game');
  };

  const handleCreateProfile = () => {
    navigate('/profile/new');
  };

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
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-pixel text-sm text-game-fg">
            🌱 Meus Perfis de Produção
          </h1>
          <button
            onClick={handleLogout}
            className="text-game-gray-700 hover:text-game-fg transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {profiles.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="flex gap-4 mb-4 text-4xl opacity-70 justify-center">
              <span className="animate-bounce delay-0">🌾</span>
              <span className="animate-bounce delay-100">🌽</span>
              <span className="animate-bounce delay-200">🌿</span>
              <span className="animate-bounce delay-300">🐄</span>
              <span className="animate-bounce delay-0">🐟</span>
            </div>
            <h2 className="font-pixel text-sm text-game-fg mb-2">
              Nenhum perfil criado
            </h2>
            <p className="font-sans text-sm text-game-gray-700 mb-6 max-w-xs">
              Crie seu primeiro perfil para começar a jogar!
            </p>
            <PixelButton onClick={handleCreateProfile} className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Criar Primeiro Perfil
            </PixelButton>
          </div>
        ) : (
          <>
            <div className="grid gap-4 mb-6">
              {profiles.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  onPlay={() => handlePlayProfile(profile.id)}
                  onDelete={() => deleteProfile(profile.id)}
                />
              ))}
            </div>

            <PixelButton 
              onClick={handleCreateProfile}
              className="w-full flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Criar Novo Perfil
            </PixelButton>
          </>
        )}
      </div>
    </GameLayout>
  );
}
