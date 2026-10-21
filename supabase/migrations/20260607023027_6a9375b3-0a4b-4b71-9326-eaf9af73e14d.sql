-- Fix 1: harden users_update_own WITH CHECK to preserve is_admin as the current value
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

-- Fix 2: remove the sensitive users table from the realtime publication.
-- The home dashboard already polls every 15s and exposes a manual refresh button,
-- so removing realtime broadcast for `users` does not break UX while eliminating
-- the risk of any sensitive field (email, balances, is_admin) leaving the DB
-- through the realtime broadcaster.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'users'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.users';
  END IF;
END $$;