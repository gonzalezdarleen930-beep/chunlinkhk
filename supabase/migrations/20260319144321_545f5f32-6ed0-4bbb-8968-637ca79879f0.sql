
-- Add identity for the admin user so email login works
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  created_at,
  updated_at,
  last_sign_in_at
)
SELECT
  gen_random_uuid(),
  id,
  jsonb_build_object('sub', id::text, 'email', email),
  'email',
  id::text,
  now(),
  now(),
  now()
FROM auth.users
WHERE email = 'abc@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM auth.identities WHERE user_id = (SELECT id FROM auth.users WHERE email = 'abc@gmail.com')
);
