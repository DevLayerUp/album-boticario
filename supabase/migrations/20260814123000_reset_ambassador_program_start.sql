-- Relança o Desafio GB em 14/08/2026: contagem começa do zero a partir deste instante.
-- Não altera a missão "Convidar amigos" (histórico completo permanece).
-- Timestamp fixo: já aplicado em produção; reexecutar não empurra o marco para "agora".

insert into public.app_settings (key, value, updated_at)
values (
  'ambassador_program_started_at',
  '2026-08-14T12:36:32.911Z',
  '2026-08-14T12:36:32.911Z'::timestamptz
)
on conflict (key) do update
set
  value = excluded.value,
  updated_at = now();

update public.user_missions um
set
  progress = 0,
  completed_at = null,
  reward_claimed = false
from public.missions m
where m.id = um.mission_id
  and m.title in ('Divulgue o álbum', 'Desafio GB: Divulgue o álbum');
