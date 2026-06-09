-- =============================================================
-- Migration 03 — Row Level Security (RLS) + policies
--
-- Convenções (boas práticas Supabase/Postgres):
--  * RLS habilitado em TODAS as tabelas do schema public.
--  * auth.uid() envolvido em (select auth.uid()) p/ caching do planner.
--  * policies com TO <role> explícito p/ não rodar à toa.
--  * escrita em tabelas de conteúdo restrita a admin (is_admin()).
--    O service_role (usado em Edge Functions/rotas server) ignora RLS.
-- =============================================================

-- -------------------------------------------------------------
-- Habilitar RLS
-- -------------------------------------------------------------
alter table public.profiles           enable row level security;
alter table public.sticker_categories enable row level security;
alter table public.rarities           enable row level security;
alter table public.stickers           enable row level security;
alter table public.user_stickers      enable row level security;
alter table public.album_pages        enable row level security;
alter table public.album_slots        enable row level security;
alter table public.user_album         enable row level security;
alter table public.packs              enable row level security;
alter table public.pack_stickers      enable row level security;
alter table public.quizzes            enable row level security;
alter table public.quiz_options       enable row level security;
alter table public.user_quiz_answers  enable row level security;
alter table public.missions           enable row level security;
alter table public.user_missions      enable row level security;
alter table public.trade_requests     enable row level security;

-- =============================================================
-- profiles
--  leitura pública (necessária para trocas) / edição apenas do próprio
-- =============================================================
drop policy if exists "profiles_read_all" on public.profiles;
create policy "profiles_read_all"
  on public.profiles for select
  to anon, authenticated
  using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- =============================================================
-- Tabelas de conteúdo (catálogo)
--  leitura para todos / escrita apenas admin
-- =============================================================
-- helper macro repetida manualmente por tabela (Postgres não tem loop em DDL puro)

-- sticker_categories
drop policy if exists "categories_read"        on public.sticker_categories;
drop policy if exists "categories_admin_write" on public.sticker_categories;
create policy "categories_read"
  on public.sticker_categories for select
  to anon, authenticated using (true);
create policy "categories_admin_write"
  on public.sticker_categories for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- rarities
drop policy if exists "rarities_read"        on public.rarities;
drop policy if exists "rarities_admin_write" on public.rarities;
create policy "rarities_read"
  on public.rarities for select
  to anon, authenticated using (true);
create policy "rarities_admin_write"
  on public.rarities for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- stickers
drop policy if exists "stickers_read"        on public.stickers;
drop policy if exists "stickers_admin_write" on public.stickers;
create policy "stickers_read"
  on public.stickers for select
  to anon, authenticated using (true);
create policy "stickers_admin_write"
  on public.stickers for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- album_pages
drop policy if exists "album_pages_read"        on public.album_pages;
drop policy if exists "album_pages_admin_write" on public.album_pages;
create policy "album_pages_read"
  on public.album_pages for select
  to anon, authenticated using (true);
create policy "album_pages_admin_write"
  on public.album_pages for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- album_slots
drop policy if exists "album_slots_read"        on public.album_slots;
drop policy if exists "album_slots_admin_write" on public.album_slots;
create policy "album_slots_read"
  on public.album_slots for select
  to anon, authenticated using (true);
create policy "album_slots_admin_write"
  on public.album_slots for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- quizzes
drop policy if exists "quizzes_read"        on public.quizzes;
drop policy if exists "quizzes_admin_write" on public.quizzes;
create policy "quizzes_read"
  on public.quizzes for select
  to anon, authenticated using (true);
create policy "quizzes_admin_write"
  on public.quizzes for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- quiz_options
--  leitura para authenticated (não expor is_correct ao público anônimo)
drop policy if exists "quiz_options_read"        on public.quiz_options;
drop policy if exists "quiz_options_admin_write" on public.quiz_options;
create policy "quiz_options_read"
  on public.quiz_options for select
  to authenticated using (true);
create policy "quiz_options_admin_write"
  on public.quiz_options for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- missions
drop policy if exists "missions_read"        on public.missions;
drop policy if exists "missions_admin_write" on public.missions;
create policy "missions_read"
  on public.missions for select
  to anon, authenticated using (true);
create policy "missions_admin_write"
  on public.missions for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- =============================================================
-- Tabelas do usuário (dono acessa o próprio dado)
-- =============================================================

-- user_stickers
drop policy if exists "user_stickers_own" on public.user_stickers;
create policy "user_stickers_own"
  on public.user_stickers for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- user_album
drop policy if exists "user_album_own" on public.user_album;
create policy "user_album_own"
  on public.user_album for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- packs
drop policy if exists "packs_own" on public.packs;
create policy "packs_own"
  on public.packs for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- pack_stickers — acesso via posse do pack (lacuna coberta vs. spec)
drop policy if exists "pack_stickers_read_own" on public.pack_stickers;
create policy "pack_stickers_read_own"
  on public.pack_stickers for select
  to authenticated
  using (
    exists (
      select 1 from public.packs p
      where p.id = pack_stickers.pack_id
        and p.user_id = (select auth.uid())
    )
  );

-- user_quiz_answers
drop policy if exists "user_quiz_answers_own" on public.user_quiz_answers;
create policy "user_quiz_answers_own"
  on public.user_quiz_answers for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- user_missions
drop policy if exists "user_missions_own" on public.user_missions;
create policy "user_missions_own"
  on public.user_missions for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- =============================================================
-- trade_requests — requester e receiver enxergam; criação pelo requester
-- =============================================================
drop policy if exists "trade_read"   on public.trade_requests;
drop policy if exists "trade_create" on public.trade_requests;
drop policy if exists "trade_update" on public.trade_requests;

create policy "trade_read"
  on public.trade_requests for select
  to authenticated
  using (
    (select auth.uid()) = requester_id
    or (select auth.uid()) = receiver_id
  );

create policy "trade_create"
  on public.trade_requests for insert
  to authenticated
  with check ((select auth.uid()) = requester_id);

create policy "trade_update"
  on public.trade_requests for update
  to authenticated
  using (
    (select auth.uid()) = requester_id
    or (select auth.uid()) = receiver_id
  )
  with check (
    (select auth.uid()) = requester_id
    or (select auth.uid()) = receiver_id
  );
