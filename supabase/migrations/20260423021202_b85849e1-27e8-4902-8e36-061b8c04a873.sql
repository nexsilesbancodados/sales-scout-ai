DO $$
DECLARE
  v_user_id UUID := gen_random_uuid();
BEGIN
  -- Insert into auth.users (triggers will handle profiles, user_settings, and antiban_config)
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'torloni.rendaextra@gmail.com',
    crypt('@Costagold2026', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Torloni Renda Extra"}',
    'authenticated',
    'authenticated',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- Insert lifetime subscription for the newly created user
  INSERT INTO public.subscriptions (
    user_id,
    plan,
    status,
    amount,
    started_at,
    expires_at,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    'enterprise',
    'active',
    0,
    now(),
    now() + interval '100 years',
    now(),
    now()
  );
END $$;