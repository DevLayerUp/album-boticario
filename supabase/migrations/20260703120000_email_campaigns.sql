-- =============================================================
-- Campanhas de e-mail programadas (admin → Resend)
-- =============================================================

create table if not exists public.email_campaigns (
  id              bigserial primary key,
  title           text not null,
  category        text not null
                  check (category in ('aviso', 'notificacao', 'novidade')),
  audience        text not null
                  check (audience in ('marketing_opt_in', 'all_users', 'admins_test')),
  audience_filter jsonb not null default '{}',
  html_body       text not null,
  scheduled_at    timestamptz not null,
  status          text not null default 'draft'
                  check (status in ('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled')),
  sent_at         timestamptz,
  stats           jsonb not null default '{}',
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_email_campaigns_status_scheduled
  on public.email_campaigns (status, scheduled_at)
  where status in ('scheduled', 'sending');

create table if not exists public.email_campaign_logs (
  id          bigserial primary key,
  campaign_id bigint not null references public.email_campaigns(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete set null,
  email       text not null,
  status      text not null check (status in ('sent', 'failed', 'skipped')),
  resend_id   text,
  error       text,
  sent_at     timestamptz not null default now()
);

create index if not exists idx_email_campaign_logs_campaign
  on public.email_campaign_logs (campaign_id);

create unique index if not exists idx_email_campaign_logs_campaign_email
  on public.email_campaign_logs (campaign_id, email);

alter table public.email_campaigns    enable row level security;
alter table public.email_campaign_logs enable row level security;

drop policy if exists "email_campaigns_admin" on public.email_campaigns;
create policy "email_campaigns_admin"
  on public.email_campaigns for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "email_campaign_logs_admin" on public.email_campaign_logs;
create policy "email_campaign_logs_admin"
  on public.email_campaign_logs for all
  using (public.is_admin())
  with check (public.is_admin());
