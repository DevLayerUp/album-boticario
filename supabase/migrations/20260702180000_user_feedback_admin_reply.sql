-- Resposta do admin ao feedback (texto + timestamp para histórico no painel).

alter table public.user_feedback
  add column if not exists admin_reply text,
  add column if not exists admin_reply_at timestamptz;

comment on column public.user_feedback.admin_reply is
  'Última resposta enviada ao usuário por e-mail.';
comment on column public.user_feedback.admin_reply_at is
  'Data/hora do envio da última resposta ao usuário.';
