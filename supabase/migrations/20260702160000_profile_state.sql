-- Estado (UF) no perfil do usuário — coletado no cadastro da landing,
-- persistido no profile e usado na missão "Completar perfil" + export CSV.

alter table public.profiles
  add column if not exists state text;

comment on column public.profiles.state is
  'Estado (UF) informado no cadastro da landing / editável no perfil.';

-- Atualiza o trigger de signup para também gravar o estado vindo do metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_referrer_id uuid;
  v_invite_code text;
  v_newsletter boolean;
begin
  v_invite_code := upper(trim(coalesce(new.raw_user_meta_data->>'referral_code', '')));

  if v_invite_code <> '' then
    select id into v_referrer_id
    from public.profiles
    where referral_code = v_invite_code
      and id <> new.id
    limit 1;
  end if;

  v_newsletter := coalesce(new.raw_user_meta_data->>'newsletter_opt_in', 'true') = 'true';

  insert into public.profiles (
    id,
    display_name,
    avatar_url,
    birth_date,
    referral_code,
    referred_by,
    city,
    state,
    notify_marketing
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url',
    nullif(new.raw_user_meta_data->>'birth_date', '')::date,
    public.generate_referral_code(),
    v_referrer_id,
    nullif(trim(coalesce(new.raw_user_meta_data->>'city', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'state', '')), ''),
    v_newsletter
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
