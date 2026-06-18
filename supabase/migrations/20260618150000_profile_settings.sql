-- Campos de perfil para layout /perfil (dados, notificações, privacidade)

alter table public.profiles
  add column if not exists bio text,
  add column if not exists show_in_ranking boolean not null default true,
  add column if not exists notify_new_packs boolean not null default true,
  add column if not exists notify_trades boolean not null default true,
  add column if not exists notify_marketing boolean not null default false,
  add column if not exists language text not null default 'pt-BR',
  add column if not exists timezone text not null default 'America/Sao_Paulo';

comment on column public.profiles.bio is 'Texto livre exibido em Sobre você no perfil';
comment on column public.profiles.show_in_ranking is 'Se false, usuário não aparece no ranking público';
