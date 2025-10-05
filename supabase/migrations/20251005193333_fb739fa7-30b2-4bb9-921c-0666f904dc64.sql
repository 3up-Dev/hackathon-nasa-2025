-- Criar VIEW para ranking público (sem expor user_id)
CREATE OR REPLACE VIEW public.public_rankings AS
SELECT 
  id,
  profile_name,
  crop_id,
  sector,
  state_id,
  total_score,
  last_played_at,
  RANK() OVER (ORDER BY total_score DESC, last_played_at DESC) as ranking_position
FROM game_profiles
ORDER BY total_score DESC, last_played_at DESC;

-- Permitir SELECT público na VIEW
GRANT SELECT ON public.public_rankings TO anon, authenticated;