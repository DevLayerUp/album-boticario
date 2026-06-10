-- =============================================================
-- Convites / indicações — código por usuário + rastreio de cadastros
-- =============================================================

alter table public.profiles
  add column if not exists referral_code text unique,
  add column if not exists referred_by uuid references public.profiles(id) on delete set null;

create index if not exists profiles_referred_by_idx on public.profiles(referred_by);

-- Gera código curto legível (sem 0/O, 1/I para evitar confusão)
create or replace function public.generate_referral_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
begin
  loop
    result := '';
    for i in 1..8 loop
      result := result || substr(chars, (floor(random() * length(chars))::int + 1), 1);
    end loop;
    exit when not exists (select 1 from public.profiles where referral_code = result);
  end loop;
  return result;
end;
$$;

-- Garante código de convite para usuários existentes
create or replace function public.ensure_referral_code(p_user_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code text;
begin
  if p_user_id is null then
    return null;
  end if;

  select referral_code into v_code
  from public.profiles
  where id = p_user_id;

  if v_code is not null then
    return v_code;
  end if;

  v_code := public.generate_referral_code();

  update public.profiles
  set referral_code = v_code
  where id = p_user_id;

  return v_code;
end;
$$;

-- Atribui convite após OAuth ou cadastros sem metadata
create or replace function public.claim_referral(p_code text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_referrer_id uuid;
  v_normalized text;
begin
  if v_user_id is null then
    return false;
  end if;

  v_normalized := upper(trim(coalesce(p_code, '')));
  if v_normalized = '' then
    return false;
  end if;

  select id into v_referrer_id
  from public.profiles
  where referral_code = v_normalized
  limit 1;

  if v_referrer_id is null or v_referrer_id = v_user_id then
    return false;
  end if;

  update public.profiles
  set referred_by = v_referrer_id
  where id = v_user_id
    and referred_by is null;

  return found;
end;
$$;

grant execute on function public.ensure_referral_code(uuid) to authenticated;
grant execute on function public.claim_referral(text) to authenticated;

-- Trigger de novo usuário: código próprio + convite do metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_referrer_id uuid;
  v_invite_code text;
begin
  v_invite_code := upper(trim(coalesce(new.raw_user_meta_data->>'referral_code', '')));

  if v_invite_code <> '' then
    select id into v_referrer_id
    from public.profiles
    where referral_code = v_invite_code
      and id <> new.id
    limit 1;
  end if;

  insert into public.profiles (
    id,
    display_name,
    avatar_url,
    birth_date,
    referral_code,
    referred_by
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url',
    nullif(new.raw_user_meta_data->>'birth_date', '')::date,
    public.generate_referral_code(),
    v_referrer_id
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
