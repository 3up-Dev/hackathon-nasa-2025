-- Fix linter: set search_path for helper functions and mark stability
CREATE OR REPLACE FUNCTION public.slugify(text_input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  result TEXT;
BEGIN
  result := lower(trim(text_input));
  result := translate(result,
    'áàãâäéèêëíìîïóòõôöúùûüçñÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇÑ',
    'aaaaaeeeeiiiiooooouuuucnaaaaaeeeeiiiiooooouuuucn'
  );
  result := regexp_replace(result, '[^a-z0-9]', '', 'g');
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_unique_username(full_name_input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 1;
  name_parts TEXT[];
BEGIN
  name_parts := string_to_array(trim(full_name_input), ' ');
  IF array_length(name_parts, 1) >= 2 THEN
    base_username := public.slugify(name_parts[1] || name_parts[array_length(name_parts, 1)]);
  ELSE
    base_username := public.slugify(name_parts[1]);
  END IF;
  IF length(base_username) < 3 THEN
    base_username := base_username || 'user';
  END IF;
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;
  RETURN final_username;
END;
$$;