-- Campanha 10 mil Fãs por Natureza: no máximo um pacote bônus por usuário.
create unique index if not exists packs_bonus_10k_once_per_user
  on public.packs (user_id)
  where source = 'bonus_10k';
