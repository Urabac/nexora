
-- 1. Admin flag on users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- 2. Security definer check (avoids RLS recursion on users)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT is_admin FROM public.users WHERE id = _user_id), false);
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;

-- 3. Admin RLS policies (read+update everything)
CREATE POLICY users_admin_select_all ON public.users
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY users_admin_update_all ON public.users
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY tx_admin_select_all ON public.transactions
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY tx_admin_update_all ON public.transactions
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY investments_admin_select_all ON public.investments
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY earn_admin_select_all ON public.daily_earnings
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- 4. Daily earnings processor — runs once per day
CREATE OR REPLACE FUNCTION public.process_daily_earnings()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv RECORD;
  earning NUMERIC;
  new_days INTEGER;
  new_status TEXT;
  processed INTEGER := 0;
BEGIN
  FOR inv IN
    SELECT i.id, i.user_id, i.amount, i.days_completed, i.earned_so_far,
           p.daily_interest, p.duration_days
    FROM public.investments i
    JOIN public.packages p ON p.id = i.package_id
    WHERE i.status = 'active'
      AND i.days_completed < p.duration_days
      AND NOT EXISTS (
        SELECT 1 FROM public.daily_earnings d
        WHERE d.investment_id = i.id AND d.date = CURRENT_DATE
      )
  LOOP
    earning := inv.amount * inv.daily_interest;
    new_days := inv.days_completed + 1;
    new_status := CASE WHEN new_days >= inv.duration_days THEN 'completed' ELSE 'active' END;

    INSERT INTO public.daily_earnings
      (investment_id, user_id, day_number, amount_earned, total_accumulated)
    VALUES
      (inv.id, inv.user_id, new_days, earning, inv.earned_so_far + earning);

    UPDATE public.investments
    SET days_completed = new_days,
        earned_so_far = earned_so_far + earning,
        status = new_status
    WHERE id = inv.id;

    UPDATE public.users
    SET available_balance = available_balance + earning,
        total_earned = total_earned + earning
    WHERE id = inv.user_id;

    processed := processed + 1;
  END LOOP;

  RETURN processed;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.process_daily_earnings() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_daily_earnings() TO service_role;
