-- Permite RETURNING após insert de feedback (PostgREST .select() após .insert())

drop policy if exists "user_feedback_select_own" on public.user_feedback;
create policy "user_feedback_select_own"
  on public.user_feedback for select
  to authenticated
  using ((select auth.uid()) = user_id);
