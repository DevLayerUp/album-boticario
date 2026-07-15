-- Missão "Seguir redes" + tiers progressivos de trocas/quiz.
-- Apenas INSERTs e colunas novas — não altera missões legadas em produção.

alter table public.profiles
  add column if not exists social_followed_at timestamptz;

comment on column public.profiles.social_followed_at is
  'Momento em que o usuário confirmou que segue a Fundação nas redes sociais (missão).';

alter table public.missions
  add column if not exists tier_group text,
  add column if not exists tier_order int,
  add column if not exists progress_baseline int;

comment on column public.missions.tier_group is
  'Cadeia de tiers progressivos: trade | quiz. NULL = missão legada.';
comment on column public.missions.tier_order is
  'Ordem na cadeia (2+). Tier 1 legado não usa este campo.';
comment on column public.missions.progress_baseline is
  'Meta acumulada do tier anterior (ex.: tier 15 trocas começa após 5).';

insert into public.missions (
  title,
  description,
  type,
  target_value,
  reward_packs,
  reward_points,
  theme,
  instructions,
  action_label,
  action_href,
  progress_unit,
  sort_order,
  tier_group,
  tier_order,
  progress_baseline,
  is_active
)
select *
from (
  values
    (
      'Seguir a Fundação nas redes',
      'Siga os perfis oficiais da Fundação Grupo Boticário nas redes sociais.',
      'custom',
      1,
      1,
      100,
      'green',
      'Acesse os perfis oficiais da Fundação nas redes sociais e confirme que já segue.',
      'Ver redes sociais',
      '/missoes',
      null::text,
      7,
      null::text,
      null::int,
      null::int,
      true
    ),
    (
      'Fazer 15 trocas',
      'Realize 15 trocas aceitas com outros colecionadores.',
      'trade_count',
      15,
      2,
      100,
      'brown',
      'Continue trocando figurinhas repetidas até completar 15 trocas aceitas no total.',
      'Ir para Trocas',
      '/trocas',
      'trocas',
      11,
      'trade',
      2,
      5,
      true
    ),
    (
      'Fazer 25 trocas',
      'Realize 25 trocas aceitas com outros colecionadores.',
      'trade_count',
      25,
      2,
      100,
      'brown',
      'Continue trocando figurinhas repetidas até completar 25 trocas aceitas no total.',
      'Ir para Trocas',
      '/trocas',
      'trocas',
      12,
      'trade',
      3,
      15,
      true
    ),
    (
      'Fazer 50 trocas',
      'Realize 50 trocas aceitas com outros colecionadores.',
      'trade_count',
      50,
      2,
      100,
      'brown',
      'Continue trocando figurinhas repetidas até completar 50 trocas aceitas no total.',
      'Ir para Trocas',
      '/trocas',
      'trocas',
      13,
      'trade',
      4,
      25,
      true
    ),
    (
      'Fazer 75 trocas',
      'Realize 75 trocas aceitas com outros colecionadores.',
      'trade_count',
      75,
      2,
      100,
      'brown',
      'Continue trocando figurinhas repetidas até completar 75 trocas aceitas no total.',
      'Ir para Trocas',
      '/trocas',
      'trocas',
      14,
      'trade',
      5,
      50,
      true
    ),
    (
      'Fazer 100 trocas',
      'Realize 100 trocas aceitas com outros colecionadores.',
      'trade_count',
      100,
      2,
      100,
      'brown',
      'Continue trocando figurinhas repetidas até completar 100 trocas aceitas no total.',
      'Ir para Trocas',
      '/trocas',
      'trocas',
      15,
      'trade',
      6,
      75,
      true
    ),
    (
      'Acertar 10 quizzes',
      'Responda corretamente 10 quizzes no total.',
      'quiz_streak',
      10,
      2,
      100,
      'blue',
      'Acesse o Quiz do Dia e continue acertando perguntas para avançar nesta missão.',
      'Responder Quiz',
      '/quiz',
      'quizzes',
      21,
      'quiz',
      2,
      5,
      true
    ),
    (
      'Acertar 15 quizzes',
      'Responda corretamente 15 quizzes no total.',
      'quiz_streak',
      15,
      2,
      100,
      'blue',
      'Acesse o Quiz do Dia e continue acertando perguntas para avançar nesta missão.',
      'Responder Quiz',
      '/quiz',
      'quizzes',
      22,
      'quiz',
      3,
      10,
      true
    ),
    (
      'Acertar 20 quizzes',
      'Responda corretamente 20 quizzes no total.',
      'quiz_streak',
      20,
      2,
      100,
      'blue',
      'Acesse o Quiz do Dia e continue acertando perguntas para avançar nesta missão.',
      'Responder Quiz',
      '/quiz',
      'quizzes',
      23,
      'quiz',
      4,
      15,
      true
    ),
    (
      'Acertar 30 quizzes',
      'Responda corretamente 30 quizzes no total.',
      'quiz_streak',
      30,
      2,
      100,
      'blue',
      'Acesse o Quiz do Dia e continue acertando perguntas para avançar nesta missão.',
      'Responder Quiz',
      '/quiz',
      'quizzes',
      24,
      'quiz',
      5,
      20,
      true
    ),
    (
      'Acertar 50 quizzes',
      'Responda corretamente 50 quizzes no total.',
      'quiz_streak',
      50,
      2,
      100,
      'blue',
      'Acesse o Quiz do Dia e continue acertando perguntas para avançar nesta missão.',
      'Responder Quiz',
      '/quiz',
      'quizzes',
      25,
      'quiz',
      6,
      30,
      true
    )
) as seed (
  title,
  description,
  type,
  target_value,
  reward_packs,
  reward_points,
  theme,
  instructions,
  action_label,
  action_href,
  progress_unit,
  sort_order,
  tier_group,
  tier_order,
  progress_baseline,
  is_active
)
where not exists (
  select 1 from public.missions m where m.title = seed.title
);
