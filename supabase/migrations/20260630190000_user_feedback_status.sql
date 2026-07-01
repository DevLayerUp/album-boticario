-- Status de triagem dos feedbacks no admin

alter table public.user_feedback
  add column if not exists status text not null default 'pending'
  check (status in ('pending', 'in_progress', 'resolved', 'dismissed'));

create index if not exists idx_user_feedback_status
  on public.user_feedback (status, created_at desc);

comment on column public.user_feedback.status is 'pending | in_progress | resolved | dismissed';
