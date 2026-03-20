UPDATE auth.users 
SET 
  recovery_token = '',
  email_change_token_new = '',
  email_change_token_current = ''
WHERE email = 'abc@gmail.com' 
AND (recovery_token IS NULL OR email_change_token_new IS NULL OR email_change_token_current IS NULL);