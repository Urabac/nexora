
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS user_id_pay text;

DROP POLICY IF EXISTS users_update_own ON public.users;
CREATE POLICY users_update_own ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND is_admin = (SELECT u.is_admin FROM public.users u WHERE u.id = auth.uid())
    AND available_balance = (SELECT u.available_balance FROM public.users u WHERE u.id = auth.uid())
    AND invested_balance = (SELECT u.invested_balance FROM public.users u WHERE u.id = auth.uid())
    AND total_earned = (SELECT u.total_earned FROM public.users u WHERE u.id = auth.uid())
    AND status = (SELECT u.status FROM public.users u WHERE u.id = auth.uid())
    AND referral_code = (SELECT u.referral_code FROM public.users u WHERE u.id = auth.uid())
  );
