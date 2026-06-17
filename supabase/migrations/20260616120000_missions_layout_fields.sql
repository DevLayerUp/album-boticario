-- Campos extras para layout de missões (Figma) e ordenação na listagem.

alter table public.missions
  add column if not exists sort_order int not null default 0,
  add column if not exists reward_points int not null default 100,
  add column if not exists theme text not null default 'green',
  add column if not exists instructions text,
  add column if not exists action_label text,
  add column if not exists action_href text,
  add column if not exists progress_unit text;

create index if not exists idx_missions_sort_order on public.missions (sort_order);
