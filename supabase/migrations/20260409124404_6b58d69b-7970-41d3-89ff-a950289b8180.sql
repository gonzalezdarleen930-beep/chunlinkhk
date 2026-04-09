
-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to insert their own member role
CREATE POLICY "Users can insert own member role" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND role = 'member');
