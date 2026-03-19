
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'member');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Admin can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete roles" ON public.user_roles
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Create loan_accounts table
CREATE TABLE public.loan_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  loan_number TEXT NOT NULL,
  loan_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  outstanding_principal NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_outstanding NUMERIC(12,2) NOT NULL DEFAULT 0,
  remaining_periods INTEGER NOT NULL DEFAULT 0,
  monthly_payment NUMERIC(12,2) NOT NULL DEFAULT 0,
  annual_interest_rate NUMERIC(6,4) NOT NULL DEFAULT 0,
  loan_date DATE NOT NULL,
  loan_expiry_date DATE NOT NULL,
  repayment_bank TEXT NOT NULL DEFAULT '',
  repayment_account TEXT NOT NULL DEFAULT '',
  repayment_day INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.loan_accounts ENABLE ROW LEVEL SECURITY;

-- Members can only view their own loan
CREATE POLICY "Members view own loan" ON public.loan_accounts
  FOR SELECT USING (auth.uid() = user_id);

-- Admin can view all loans
CREATE POLICY "Admin views all loans" ON public.loan_accounts
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Admin can insert loans
CREATE POLICY "Admin inserts loans" ON public.loan_accounts
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin can update loans
CREATE POLICY "Admin updates loans" ON public.loan_accounts
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Admin can delete loans
CREATE POLICY "Admin deletes loans" ON public.loan_accounts
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_loan_accounts_updated_at
  BEFORE UPDATE ON public.loan_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
