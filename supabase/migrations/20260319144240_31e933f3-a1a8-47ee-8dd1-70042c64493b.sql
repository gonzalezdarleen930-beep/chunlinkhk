
-- Create admin user in auth.users (without ON CONFLICT)
DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO admin_id FROM auth.users WHERE email = 'abc@gmail.com';
  
  IF admin_id IS NULL THEN
    admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role
    ) VALUES (
      admin_id,
      '00000000-0000-0000-0000-000000000000',
      'abc@gmail.com',
      crypt('abc123456', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      'authenticated',
      'authenticated'
    );
  END IF;

  -- Assign admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (admin_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;
