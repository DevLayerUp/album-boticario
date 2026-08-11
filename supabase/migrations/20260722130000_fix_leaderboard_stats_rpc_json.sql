-- Corrige get_leaderboard_stats: retorno em JSONB (1 linha) evita o limite de 1000 linhas do PostgREST.

do $$
declare
  fn regprocedure;
begin
  for fn in
    select p.oid::regprocedure
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'get_leaderboard_stats'
  loop
    execute format('drop function if exists %s', fn);
  end loop;
end $$;

create or replace function public.get_leaderboard_stats()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with filled as (
    select ua.user_id, count(*)::bigint as filled_slots
    from public.user_album ua
    inner join public.album_slots als on als.id = ua.slot_id
    where als.sticker_id is not null
    group by ua.user_id
  ),
  pack_stats as (
    select
      p.user_id,
      count(*) filter (where p.opened_at is not null)::bigint as packs_opened,
      count(*) filter (where p.opened_at is null)::bigint as packs_unopened
    from public.packs p
    group by p.user_id
  ),
  mission_stats as (
    select um.user_id, count(*)::bigint as missions_completed
    from public.user_missions um
    where um.completed_at is not null
    group by um.user_id
  ),
  trade_stats as (
    select t.user_id, sum(t.cnt)::bigint as trades_accepted
    from (
      select tr.requester_id as user_id, count(*)::bigint as cnt
      from public.trade_requests tr
      where tr.status = 'accepted'
      group by tr.requester_id
      union all
      select tr.receiver_id, count(*)::bigint
      from public.trade_requests tr
      where tr.status = 'accepted'
      group by tr.receiver_id
    ) t
    group by t.user_id
  ),
  stats as (
    select
      p.id as user_id,
      p.display_name,
      p.username,
      p.sticker_url,
      p.avatar_url,
      p.show_in_ranking,
      p.ranking_score,
      p.ranking_score_updated_at,
      coalesce(f.filled_slots, 0) as filled_slots,
      coalesce(ps.packs_opened, 0) as packs_opened,
      coalesce(ps.packs_unopened, 0) as packs_unopened,
      coalesce(ms.missions_completed, 0) as missions_completed,
      coalesce(ts.trades_accepted, 0) as trades_accepted
    from public.profiles p
    left join filled f on f.user_id = p.id
    left join pack_stats ps on ps.user_id = p.id
    left join mission_stats ms on ms.user_id = p.id
    left join trade_stats ts on ts.user_id = p.id
  )
  select coalesce(jsonb_agg(to_jsonb(stats)), '[]'::jsonb)
  from stats;
$$;

comment on function public.get_leaderboard_stats() is
  'Estatísticas agregadas por usuário para o ranking (JSONB único, sem limite de 1000 linhas do PostgREST).';

revoke all on function public.get_leaderboard_stats() from public;
grant execute on function public.get_leaderboard_stats() to service_role;
