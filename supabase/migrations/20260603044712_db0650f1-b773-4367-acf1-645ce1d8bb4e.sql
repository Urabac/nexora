
-- Fix privilege escalation: prevent users from updating sensitive columns on their own row
DROP POLICY IF EXISTS users_update_own ON public.users;

CREATE POLICY users_update_own ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND is_admin = false
    AND available_balance = (SELECT available_balance FROM public.users WHERE id = auth.uid())
    AND invested_balance = (SELECT invested_balance FROM public.users WHERE id = auth.uid())
    AND total_earned = (SELECT total_earned FROM public.users WHERE id = auth.uid())
    AND status = (SELECT status FROM public.users WHERE id = auth.uid())
    AND referral_code = (SELECT referral_code FROM public.users WHERE id = auth.uid())
  );

-- Lock down SECURITY DEFINER functions so they cannot be invoked by clients
REVOKE EXECUTE ON FUNCTION public.process_daily_earnings() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
