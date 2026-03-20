-- Restore admin role for the new user
INSERT INTO public.user_roles (user_id, role)
VALUES ('41df00bb-70d1-43d8-8116-05ef174e5259', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;