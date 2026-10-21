-- Prevent users from updating sensitive financial fields on their investments.
-- All investment mutations (days_completed, earned_so_far, status, amount) must
-- happen server-side via the service role.
DROP POLICY IF EXISTS investments_update_own ON public.investments;

-- Explicitly deny client-side writes to daily_earnings.
-- Only the service role (which bypasses RLS) may insert/update/delete.
CREATE POLICY daily_earnings_no_insert ON public.daily_earnings
  FOR INSERT TO authenticated WITH CHECK (false);

CREATE POLICY daily_earnings_no_update ON public.daily_earnings
  FOR UPDATE TO authenticated USING (false);

CREATE POLICY daily_earnings_no_delete ON public.daily_earnings
  FOR DELETE TO authenticated USING (false);
