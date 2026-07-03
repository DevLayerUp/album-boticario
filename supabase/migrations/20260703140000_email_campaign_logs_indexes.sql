-- Índice para consultas de log por campanha e status (dashboard admin).

create index if not exists idx_email_campaign_logs_campaign_status
  on public.email_campaign_logs (campaign_id, status);

create index if not exists idx_email_campaign_logs_campaign_sent_at
  on public.email_campaign_logs (campaign_id, sent_at desc);
