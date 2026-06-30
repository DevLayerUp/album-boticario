-- =============================================================
-- Telefone no perfil do usuário
-- Aceita os formatos BR: (00) 0000-0000 e (00) 00000-0000
-- =============================================================

alter table public.profiles
  add column if not exists phone text;

comment on column public.profiles.phone is
  'Telefone do usuário em formato BR: (00) 0000-0000 (fixo) ou (00) 00000-0000 (celular).';
