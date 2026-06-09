-- =============================================================
-- Migration 02 — Funções e triggers
-- =============================================================

-- -------------------------------------------------------------
-- handle_new_user — cria um profile a cada novo usuário em auth.users
-- security definer + search_path fixo (boa prática de segurança)
-- -------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -------------------------------------------------------------
-- set_updated_at — mantém profiles.updated_at em sincronia
-- -------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- -------------------------------------------------------------
-- is_admin — true quando o JWT do usuário tem role = 'admin'
-- Lê de app_metadata (preferencial, não editável pelo usuário) com
-- fallback para user_metadata. Usada nas policies de conteúdo/admin.
-- -------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata'  ->> 'role') = 'admin',
    false
  )
  or coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
    false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon, service_role;
