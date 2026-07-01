-- Feedback dos usuários (dashboard)

create table if not exists public.user_feedback (
  id         bigserial primary key,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null
             check (type in ('bug', 'suggestion', 'praise', 'other')),
  status     text not null default 'pending'
             check (status in ('pending', 'in_progress', 'resolved', 'dismissed')),
  message    text not null
             check (char_length(trim(message)) between 10 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists idx_user_feedback_created
  on public.user_feedback (created_at desc);

create index if not exists idx_user_feedback_user
  on public.user_feedback (user_id, created_at desc);

create index if not exists idx_user_feedback_type
  on public.user_feedback (type, created_at desc);

create index if not exists idx_user_feedback_status
  on public.user_feedback (status, created_at desc);

alter table public.user_feedback enable row level security;

drop policy if exists "user_feedback_insert_own" on public.user_feedback;
create policy "user_feedback_insert_own"
  on public.user_feedback for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "user_feedback_select_own" on public.user_feedback;
create policy "user_feedback_select_own"
  on public.user_feedback for select
  to authenticated
  using ((select auth.uid()) = user_id);

comment on table public.user_feedback is 'Feedback enviado pelos usuários na dashboard';
comment on column public.user_feedback.type is 'bug | suggestion | praise | other';
comment on column public.user_feedback.status is 'pending | in_progress | resolved | dismissed';
