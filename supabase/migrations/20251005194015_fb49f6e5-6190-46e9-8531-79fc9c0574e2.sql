-- 1. Adicionar coluna username na tabela profiles (temporariamente nullable para migração)
ALTER TABLE public.profiles 
ADD COLUMN username TEXT;

-- 2. Criar função para remover acentos e caracteres especiais
CREATE OR REPLACE FUNCTION public.slugify(text_input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  result TEXT;
BEGIN
  result := lower(trim(text_input));
  
  -- Remover acentos
  result := translate(result,
    'áàãâäéèêëíìîïóòõôöúùûüçñÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇÑ',
    'aaaaaeeeeiiiiooooouuuucnaaaaaeeeeiiiiooooouuuucn'
  );
  
  -- Remover caracteres especiais e espaços
  result := regexp_replace(result, '[^a-z0-9]', '', 'g');
  
  RETURN result;
END;
$$;

-- 3. Criar função para gerar username único
CREATE OR REPLACE FUNCTION public.generate_unique_username(full_name_input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 1;
  name_parts TEXT[];
BEGIN
  -- Dividir o nome em partes
  name_parts := string_to_array(trim(full_name_input), ' ');
  
  -- Pegar primeiro nome e último sobrenome
  IF array_length(name_parts, 1) >= 2 THEN
    base_username := public.slugify(name_parts[1] || name_parts[array_length(name_parts, 1)]);
  ELSE
    base_username := public.slugify(name_parts[1]);
  END IF;
  
  -- Garantir que tenha pelo menos 3 caracteres
  IF length(base_username) < 3 THEN
    base_username := base_username || 'user';
  END IF;
  
  final_username := base_username;
  
  -- Verificar se username já existe e adicionar número se necessário
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;
  
  RETURN final_username;
END;
$$;

-- 4. Criar função trigger para gerar username automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user_username()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se username não foi fornecido, gerar automaticamente
  IF NEW.username IS NULL OR NEW.username = '' THEN
    NEW.username := public.generate_unique_username(NEW.full_name);
  END IF;
  
  RETURN NEW;
END;
$$;

-- 5. Criar trigger BEFORE INSERT para gerar username
CREATE TRIGGER generate_username_on_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_username();

-- 6. Gerar usernames para usuários existentes
DO $$
DECLARE
  profile_record RECORD;
  new_username TEXT;
BEGIN
  FOR profile_record IN 
    SELECT id, full_name FROM public.profiles WHERE username IS NULL
  LOOP
    new_username := public.generate_unique_username(profile_record.full_name);
    UPDATE public.profiles 
    SET username = new_username 
    WHERE id = profile_record.id;
  END LOOP;
END $$;

-- 7. Tornar username NOT NULL e adicionar constraints
ALTER TABLE public.profiles 
ALTER COLUMN username SET NOT NULL;

-- 8. Adicionar índice único para username
CREATE UNIQUE INDEX idx_profiles_username ON public.profiles(username);

-- 9. Adicionar constraint de formato (opcional, mas recomendado)
ALTER TABLE public.profiles 
ADD CONSTRAINT username_format CHECK (username ~ '^[a-z0-9]{3,50}$');

-- 10. Recriar a view public_rankings para incluir username
DROP VIEW IF EXISTS public.public_rankings;

CREATE VIEW public.public_rankings AS
SELECT 
  gp.id,
  p.username,
  gp.profile_name,
  gp.crop_id,
  gp.sector,
  gp.state_id,
  gp.total_score,
  gp.last_played_at,
  ROW_NUMBER() OVER (ORDER BY gp.total_score DESC, gp.last_played_at DESC) as ranking_position
FROM game_profiles gp
INNER JOIN profiles p ON p.user_id = gp.user_id
WHERE gp.total_score > 0
ORDER BY gp.total_score DESC, gp.last_played_at DESC;