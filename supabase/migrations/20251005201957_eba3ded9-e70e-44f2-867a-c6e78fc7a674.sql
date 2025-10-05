-- Add status column to game_profiles
ALTER TABLE public.game_profiles
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- Add constraint to validate status values
ALTER TABLE public.game_profiles
ADD CONSTRAINT valid_status CHECK (status IN ('active', 'completed'));

-- Create index for better performance when filtering by status
CREATE INDEX IF NOT EXISTS idx_game_profiles_status ON public.game_profiles(status);

-- Add comment for documentation
COMMENT ON COLUMN public.game_profiles.status IS 'Profile status: active (in progress) or completed (production finished and harvested)';