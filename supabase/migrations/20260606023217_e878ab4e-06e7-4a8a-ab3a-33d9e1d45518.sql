-- Realtime channel authorization: only allow a user to subscribe to a topic equal to their auth.uid()
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "realtime_user_own_topic_select" ON realtime.messages;
CREATE POLICY "realtime_user_own_topic_select"
ON realtime.messages
FOR SELECT
TO authenticated
USING ((select realtime.topic()) = (select auth.uid()::text));

-- Explicit deny DELETE on transactions for regular users (admins still bypass via service role)
DROP POLICY IF EXISTS "tx_no_delete" ON public.transactions;
CREATE POLICY "tx_no_delete"
ON public.transactions
FOR DELETE
TO authenticated
USING (false);