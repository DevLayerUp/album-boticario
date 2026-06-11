-- =============================================================
-- Notificações in-app + avisos do admin
-- =============================================================

create table if not exists public.announcements (
  id          bigserial primary key,
  title       text not null,
  body        text not null,
  href        text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz
);

create table if not exists public.notifications (
  id          bigserial primary key,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null
              check (type in (
                'trade_request',
                'trade_accepted',
                'trade_rejected',
                'quiz_available',
                'mission_complete',
                'announcement'
              )),
  title       text not null,
  body        text,
  href        text,
  dedupe_key  text,
  payload     jsonb not null default '{}',
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create unique index if not exists notifications_user_dedupe_unique
  on public.notifications (user_id, dedupe_key)
  where dedupe_key is not null;

create index if not exists idx_notifications_user_created
  on public.notifications (user_id, created_at desc);

create index if not exists idx_notifications_user_unread
  on public.notifications (user_id)
  where read_at is null;

create table if not exists public.announcement_reads (
  user_id         uuid not null references public.profiles(id) on delete cascade,
  announcement_id bigint not null references public.announcements(id) on delete cascade,
  read_at         timestamptz not null default now(),
  primary key (user_id, announcement_id)
);

alter table public.announcements    enable row level security;
alter table public.notifications    enable row level security;
alter table public.announcement_reads enable row level security;

-- Avisos: leitura para autenticados; escrita só admin
drop policy if exists "announcements_read" on public.announcements;
create policy "announcements_read"
  on public.announcements for select
  to authenticated
  using (is_active = true and (expires_at is null or expires_at > now()));

drop policy if exists "announcements_admin" on public.announcements;
create policy "announcements_admin"
  on public.announcements for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Notificações: dono lê e marca como lida
drop policy if exists "notifications_read" on public.notifications;
create policy "notifications_read"
  on public.notifications for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "notifications_update" on public.notifications;
create policy "notifications_update"
  on public.notifications for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Leitura de avisos
drop policy if exists "announcement_reads_own" on public.announcement_reads;
create policy "announcement_reads_own"
  on public.announcement_reads for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
