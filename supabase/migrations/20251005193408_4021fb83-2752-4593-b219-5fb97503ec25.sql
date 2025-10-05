-- Recriar VIEW com SECURITY INVOKER para respeitar RLS
DROP VIEW IF EXISTS public.public_rankings;

CREATE OR REPLACE VIEW public.public_rankings 
WITH (security_invoker=on) AS
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

-- Comentário sobre o que foi corrigido:
COMMENT ON VIEW public.public_rankings IS 'Ranking público de jogadores. SECURITY INVOKER garante que RLS seja respeitada por quem consulta a view.';