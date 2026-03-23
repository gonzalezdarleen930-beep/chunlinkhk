CREATE TABLE public.loan_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name_chinese TEXT NOT NULL DEFAULT '',
  name_english TEXT NOT NULL DEFAULT '',
  hkid TEXT NOT NULL DEFAULT '',
  dob TEXT NOT NULL DEFAULT '',
  gender TEXT NOT NULL DEFAULT '',
  marital_status TEXT NOT NULL DEFAULT '',
  children TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  property_type TEXT NOT NULL DEFAULT '',
  cohabitants TEXT NOT NULL DEFAULT '',
  occupation TEXT NOT NULL DEFAULT '',
  monthly_salary NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT '',
  loan_amount NUMERIC NOT NULL DEFAULT 0,
  previous_applications TEXT NOT NULL DEFAULT '',
  referral_source TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT '審批中',
  applied_loan_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin views all applications"
  ON public.loan_applications FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin updates all applications"
  ON public.loan_applications FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin deletes applications"
  ON public.loan_applications FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert application"
  ON public.loan_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Members view own application"
  ON public.loan_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE TRIGGER update_loan_applications_updated_at
  BEFORE UPDATE ON public.loan_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();