
CREATE OR REPLACE FUNCTION public.get_email_by_loan_number(_loan_number text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT la.email
  FROM public.loan_applications la
  INNER JOIN public.loan_accounts lac ON lac.user_id = la.user_id
  WHERE lac.loan_number = _loan_number
  LIMIT 1;
$$;
