-- =============================================================================
-- LIMPAR RESPOSTAS DO QUIZ DE HOJE (America/Sao_Paulo)
-- =============================================================================
--
-- O que faz:
--   • Remove linhas de user_quiz_answers com answered_at no dia civil de hoje (BRT)
--   • Usa o MESMO critério da API (/api/quiz/daily): data BRT + janela 00:00–23:59:59
--   • Libera os usuários a responder o quiz diário de novo
--
-- O que NÃO faz (revisar manualmente se precisar):
--   • Não remove pacotinhos já concedidos (packs.source = 'quiz')
--   • Não ajusta progresso de missões de quiz (reconcilia no próximo GET /api/missions)
--
-- ⚠️  Rode primeiro a seção PRÉ-VOO e confira os números.
-- ⚠️  Execute no SQL Editor do Supabase (service role).
--
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PRÉ-VOO — conferir antes de apagar
-- -----------------------------------------------------------------------------

with today_brt as (
  select to_char((now() at time zone 'America/Sao_Paulo')::date, 'YYYY-MM-DD') as d
)
select
  t.d as dia_brt,
  count(uqa.id)::bigint as respostas_hoje,
  count(uqa.id) filter (where uqa.is_correct)::bigint as acertos_hoje,
  count(distinct uqa.user_id)::bigint as usuarios_afetados
from today_brt t
left join public.user_quiz_answers uqa
  on uqa.answered_at >= (t.d || 'T00:00:00')::timestamptz
 and uqa.answered_at <= (t.d || 'T23:59:59')::timestamptz
group by t.d;

-- Detalhe por usuário (opcional)
-- with today_brt as (
--   select to_char((now() at time zone 'America/Sao_Paulo')::date, 'YYYY-MM-DD') as d
-- )
-- select
--   uqa.user_id,
--   p.display_name,
--   uqa.quiz_id,
--   uqa.is_correct,
--   uqa.answered_at
-- from today_brt t
-- join public.user_quiz_answers uqa
--   on uqa.answered_at >= (t.d || 'T00:00:00')::timestamptz
--  and uqa.answered_at <= (t.d || 'T23:59:59')::timestamptz
-- left join public.profiles p on p.id = uqa.user_id
-- order by uqa.answered_at desc;

-- -----------------------------------------------------------------------------
-- APAGAR — somente respostas de hoje
-- Descomente begin/commit para executar em transação.
-- -----------------------------------------------------------------------------

-- begin;

with today_brt as (
  select to_char((now() at time zone 'America/Sao_Paulo')::date, 'YYYY-MM-DD') as d
),
deleted as (
  delete from public.user_quiz_answers uqa
  using today_brt t
  where uqa.answered_at >= (t.d || 'T00:00:00')::timestamptz
    and uqa.answered_at <= (t.d || 'T23:59:59')::timestamptz
  returning uqa.id, uqa.user_id, uqa.quiz_id, uqa.is_correct
)
select
  count(*)::bigint as linhas_removidas,
  count(distinct user_id)::bigint as usuarios_liberados
from deleted;

-- commit;

-- -----------------------------------------------------------------------------
-- PÓS-VOO — deve retornar 0
-- -----------------------------------------------------------------------------

with today_brt as (
  select to_char((now() at time zone 'America/Sao_Paulo')::date, 'YYYY-MM-DD') as d
)
select count(*)::bigint as respostas_restantes_hoje
from today_brt t
join public.user_quiz_answers uqa
  on uqa.answered_at >= (t.d || 'T00:00:00')::timestamptz
 and uqa.answered_at <= (t.d || 'T23:59:59')::timestamptz;

-- -----------------------------------------------------------------------------
-- OPCIONAL — remover pacotinhos do quiz concedidos hoje e ainda não abertos
-- -----------------------------------------------------------------------------

-- with today_brt as (
--   select to_char((now() at time zone 'America/Sao_Paulo')::date, 'YYYY-MM-DD') as d
-- )
-- delete from public.packs p
-- using today_brt t
-- where p.source = 'quiz'
--   and p.opened_at is null
--   and p.created_at >= (t.d || 'T00:00:00')::timestamptz
--   and p.created_at <= (t.d || 'T23:59:59')::timestamptz;
