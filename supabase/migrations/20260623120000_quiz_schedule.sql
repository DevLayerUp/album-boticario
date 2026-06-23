-- Quiz scheduling: unique day per active quiz, helpers, and gap fix (Jun 24–29, 2026)

-- One active quiz per calendar day
create unique index if not exists quizzes_valid_date_active_unique
  on public.quizzes (valid_date)
  where is_active = true and valid_date is not null;

-- Next free date on or after p_from (defaults to today in America/Sao_Paulo campaign TZ)
create or replace function public.quiz_next_available_date(p_from date default (timezone('America/Sao_Paulo', now()))::date)
returns date
language sql
stable
as $$
  select d::date
  from generate_series(p_from, p_from + 365, interval '1 day') as d
  where not exists (
    select 1
    from public.quizzes q
    where q.valid_date = d::date
      and q.is_active = true
  )
  order by d
  limit 1;
$$;

-- Fill missing days in [today, today + horizon] using unscheduled quizzes first,
-- then by pulling the furthest scheduled quiz beyond the horizon.
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

    exit when candidate_id is null;

    update public.quizzes
    set valid_date = missing
    where id = candidate_id;

    assigned_count := assigned_count + 1;
  end loop;

  return assigned_count;
end;
$$;

-- Close gap Jun 24–29 by moving the last six scheduled quizzes (was Aug 1–6)
update public.quizzes set valid_date = '2026-06-24' where id = 44;
update public.quizzes set valid_date = '2026-06-25' where id = 45;
update public.quizzes set valid_date = '2026-06-26' where id = 47;
update public.quizzes set valid_date = '2026-06-27' where id = 46;
update public.quizzes set valid_date = '2026-06-28' where id = 48;
update public.quizzes set valid_date = '2026-06-29' where id = 49;
