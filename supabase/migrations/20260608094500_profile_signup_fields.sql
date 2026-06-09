-- =============================================================
-- Migration 05 — Campos extras de cadastro no profile
-- Adiciona data de nascimento e mantém display_name = nome completo
-- =============================================================

alter table public.profiles
  add column if not exists birth_date date;

-- Atualiza o trigger para também gravar a data de nascimento vinda do
-- metadata do signup. nullif evita erro de cast em string vazia.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url, birth_date)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url',
    nullif(new.raw_user_meta_data->>'birth_date', '')::date
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
