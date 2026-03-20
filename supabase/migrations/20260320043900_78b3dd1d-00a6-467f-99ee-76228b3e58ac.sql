-- Delete existing admin user and recreate cleanly
DELETE FROM auth.users WHERE email = 'abc@gmail.com';
