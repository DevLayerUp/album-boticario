-- Inscrições do Concurso Cultural (uma resposta por usuário e por CPF)

create table if not exists public.contest_entries (
  id              bigserial primary key,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  full_name       text not null
                  check (char_length(trim(full_name)) between 2 and 120),
  email           text not null
                  check (char_length(trim(email)) between 5 and 160),
  phone           text not null
                  check (char_length(trim(phone)) between 10 and 20),
  cpf_digits      text not null
                  check (cpf_digits ~ '^\d{11}$'),
  answer          text not null
                  check (char_length(trim(answer)) between 40 and 500),
  accepted_rules  boolean not null default false
                  check (accepted_rules = true),
  accepted_data   boolean not null default false
                  check (accepted_data = true),
  created_at      timestamptz not null default now(),
  unique (user_id),
  unique (cpf_digits)
);

create index if not exists idx_contest_entries_created
  on public.contest_entries (created_at desc);

alter table public.contest_entries enable row level security;

drop policy if exists "contest_entries_insert_own" on public.contest_entries;
create policy "contest_entries_insert_own"
  on public.contest_entries for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "contest_entries_select_own" on public.contest_entries;
create policy "contest_entries_select_own"
  on public.contest_entries for select
  to authenticated
  using ((select auth.uid()) = user_id or public.is_admin());

comment on table public.contest_entries is
  'Respostas do Concurso Cultural Fãs por Natureza (uma por usuário/CPF)';
