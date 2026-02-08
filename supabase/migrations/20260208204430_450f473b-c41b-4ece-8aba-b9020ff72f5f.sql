-- Update handle_new_user to also create antiban_config (which triggers message variations)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- Create user settings with defaults
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  -- Create antiban config with defaults (this triggers message variations creation)
  INSERT INTO public.antiban_config (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$function$;