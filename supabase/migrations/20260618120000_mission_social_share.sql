-- Rastreia quando o usuário compartilhou nas redes (missão "Compartilhar nas redes").

alter table public.profiles
  add column if not exists social_shared_at timestamptz;

comment on column public.profiles.social_shared_at is
  'Momento em que o usuário confirmou compartilhamento nas redes sociais (missão).';
