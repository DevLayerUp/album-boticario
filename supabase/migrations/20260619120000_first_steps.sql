-- First Steps onboarding: flag no perfil + configuração editável no admin

alter table public.profiles
  add column if not exists first_steps_completed_at timestamptz;

comment on column public.profiles.first_steps_completed_at is
  'Quando preenchido, o usuário já viu ou pulou o modal de primeiros passos';

insert into public.app_settings (key, value)
values (
  'first_steps_config',
  null
)
on conflict (key) do nothing;

-- Usuários já cadastrados não devem ver o modal retroativamente
update public.profiles
set first_steps_completed_at = coalesce(first_steps_completed_at, now())
where first_steps_completed_at is null;
