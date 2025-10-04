-- Create game_profiles table
CREATE TABLE public.game_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  profile_name text NOT NULL,
  crop_id text NOT NULL,
  sector text NOT NULL,
  state_id text NOT NULL,
  
  -- Game state
  selected_sector text,
  selected_crop text,
  indicators jsonb DEFAULT '{"production": 10, "sustainability": 10, "water": 10}'::jsonb,
  planted_states text[] DEFAULT ARRAY[]::text[],
  total_score integer DEFAULT 0,
  
  -- Production state
  production_state jsonb,
  
  -- Metadata
  is_active boolean DEFAULT false,
  completed_tutorial boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_played_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profiles"
  ON public.game_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own profiles"
  ON public.game_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profiles"
  ON public.game_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profiles"
  ON public.game_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_game_profiles_updated_at
  BEFORE UPDATE ON public.game_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for performance
CREATE INDEX idx_game_profiles_user_id ON public.game_profiles(user_id);
CREATE INDEX idx_game_profiles_is_active ON public.game_profiles(user_id, is_active);