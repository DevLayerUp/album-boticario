-- Segmento: envio para um usuário específico.

alter table public.email_campaigns
  drop constraint if exists email_campaigns_audience_check;

alter table public.email_campaigns
  add constraint email_campaigns_audience_check
  check (audience in (
    'marketing_opt_in',
    'all_users',
    'admins_test',
    'incomplete_profile',
    'incomplete_first_steps',
    'no_sticker',
    'mission_incomplete',
    'specific_user'
  ));
