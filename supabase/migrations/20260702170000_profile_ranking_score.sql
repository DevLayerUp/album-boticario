-- Pontuação persistida do ranking (sincronizada pela aplicação).

alter table public.profiles
  add column if not exists ranking_score integer not null default 0,
  add column if not exists ranking_score_updated_at timestamptz;

comment on column public.profiles.ranking_score is
  'Pontuação atual do ranking; recalculada e gravada pela aplicação após cada ação relevante.';

comment on column public.profiles.ranking_score_updated_at is
  'Última sincronização da pontuação com a atividade real do usuário.';

create index if not exists profiles_ranking_score_idx
  on public.profiles (ranking_score desc);
