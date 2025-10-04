import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Indicators {
  production: number;
  sustainability: number;
  water: number;
}

interface GameProfile {
  id: string;
  user_id: string;
  profile_name: string;
  crop_id: string;
  sector: string;
  state_id: string;
  selected_sector: string | null;
  selected_crop: string | null;
  indicators: Indicators;
  planted_states: string[];
  total_score: number;
  production_state: any;
  is_active: boolean;
  completed_tutorial: boolean;
  created_at: string;
  updated_at: string;
  last_played_at: string;
}

interface CreateProfileData {
  profile_name: string;
  crop_id: string;
  sector: string;
  state_id: string;
}

interface GameProfilesState {
  profiles: GameProfile[];
  currentProfile: GameProfile | null;
  loading: boolean;
  
  loadProfiles: () => Promise<void>;
  setActiveProfile: (profileId: string) => Promise<void>;
  createProfile: (data: CreateProfileData) => Promise<string | null>;
  updateCurrentProfile: (data: Partial<GameProfile>) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
  clearCurrentProfile: () => void;
}

export const useGameProfiles = create<GameProfilesState>((set, get) => ({
  profiles: [],
  currentProfile: null,
  loading: false,

  loadProfiles: async () => {
    set({ loading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ loading: false });
        return;
      }

      const { data, error } = await supabase
        .from('game_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('last_played_at', { ascending: false });

      if (error) throw error;

      // Parse JSON fields
      const parsedProfiles = (data || []).map(profile => ({
        ...profile,
        indicators: typeof profile.indicators === 'string' 
          ? JSON.parse(profile.indicators) 
          : (profile.indicators as unknown as Indicators),
        planted_states: profile.planted_states || [],
      })) as GameProfile[];

      set({ profiles: parsedProfiles, loading: false });

      // Se houver um perfil ativo, carregá-lo
      const activeProfile = parsedProfiles.find(p => p.is_active);
      if (activeProfile) {
        set({ currentProfile: activeProfile });
      }
    } catch (error: any) {
      console.error('Error loading profiles:', error);
      toast.error('Erro ao carregar perfis');
      set({ loading: false });
    }
  },

  setActiveProfile: async (profileId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Desativar todos os perfis
      await supabase
        .from('game_profiles')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Ativar o perfil selecionado e atualizar last_played_at
      const { data, error } = await supabase
        .from('game_profiles')
        .update({ 
          is_active: true,
          last_played_at: new Date().toISOString()
        })
        .eq('id', profileId)
        .select()
        .single();

      if (error) throw error;

      const parsedProfile = {
        ...data,
        indicators: typeof data.indicators === 'string' 
          ? JSON.parse(data.indicators) 
          : (data.indicators as unknown as Indicators),
        planted_states: data.planted_states || [],
      } as GameProfile;

      set({ currentProfile: parsedProfile });
      await get().loadProfiles();
    } catch (error: any) {
      console.error('Error setting active profile:', error);
      toast.error('Erro ao ativar perfil');
    }
  },

  createProfile: async (data: CreateProfileData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Desativar todos os perfis existentes
      await supabase
        .from('game_profiles')
        .update({ is_active: false })
        .eq('user_id', user.id);

      const { data: newProfile, error } = await supabase
        .from('game_profiles')
        .insert({
          user_id: user.id,
          profile_name: data.profile_name,
          crop_id: data.crop_id,
          sector: data.sector,
          state_id: data.state_id,
          is_active: true,
          selected_sector: data.sector,
          selected_crop: data.crop_id,
        })
        .select()
        .single();

      if (error) throw error;

      const parsedProfile = {
        ...newProfile,
        indicators: typeof newProfile.indicators === 'string' 
          ? JSON.parse(newProfile.indicators) 
          : (newProfile.indicators as unknown as Indicators),
        planted_states: newProfile.planted_states || [],
      } as GameProfile;

      set({ currentProfile: parsedProfile });
      await get().loadProfiles();
      toast.success('Perfil criado com sucesso!');
      
      return newProfile.id;
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast.error('Erro ao criar perfil');
      return null;
    }
  },

  updateCurrentProfile: async (data: Partial<GameProfile>) => {
    const { currentProfile } = get();
    if (!currentProfile) return;

    try {
      const updateData: any = { ...data };
      if (data.indicators) {
        updateData.indicators = data.indicators as unknown as any;
      }
      
      const { error } = await supabase
        .from('game_profiles')
        .update({
          ...updateData,
          last_played_at: new Date().toISOString()
        })
        .eq('id', currentProfile.id);

      if (error) throw error;

      set({ 
        currentProfile: { 
          ...currentProfile, 
          ...data,
          last_played_at: new Date().toISOString()
        } 
      });
      await get().loadProfiles();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
    }
  },

  deleteProfile: async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('game_profiles')
        .delete()
        .eq('id', profileId);

      if (error) throw error;

      const { currentProfile } = get();
      if (currentProfile?.id === profileId) {
        set({ currentProfile: null });
      }

      await get().loadProfiles();
      toast.success('Perfil deletado com sucesso!');
    } catch (error: any) {
      console.error('Error deleting profile:', error);
      toast.error('Erro ao deletar perfil');
    }
  },

  clearCurrentProfile: () => {
    set({ currentProfile: null });
  },
}));
