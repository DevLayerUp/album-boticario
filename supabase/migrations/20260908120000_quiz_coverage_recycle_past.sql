-- Recicla quizzes já vencidos para preencher dias sem pergunta.
-- Sem isso, quando todo o banco tem valid_date dentro do horizonte,
-- o cron não consegue cobrir dias novos e o quiz diário some.

create or replace function public.quiz_ensure_coverage(p_horizon_days int default 60)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  missing date;
  candidate_id int;
  assigned_count int := 0;
  horizon_end date := (timezone('America/Sao_Paulo', now()))::date + p_horizon_days;
  today date := (timezone('America/Sao_Paulo', now()))::date;
begin
  for missing in
    select d::date
    from generate_series(today, horizon_end, interval '1 day') as d
    where not exists (
      select 1
      from public.quizzes q
      where q.valid_date = d::date
        and q.is_active = true
    )
    order by d
  loop
    candidate_id := null;

    select id into candidate_id
    from public.quizzes
    where is_active = true
      and valid_date is null
    order by created_at
    limit 1;

    if candidate_id is null then
      select id into candidate_id
      from public.quizzes
      where is_active = true
        and valid_date > horizon_end
      order by valid_date desc
      limit 1;
    end if;

    if candidate_id is null then
      select id into candidate_id
      from public.quizzes
      where is_active = true
        and valid_date < today
      order by valid_date asc
      limit 1;
    end if;

    exit when candidate_id is null;

    update public.quizzes
    set valid_date = missing
    where id = candidate_id;

    assigned_count := assigned_count + 1;
  end loop;

  return assigned_count;
end;
$$;
