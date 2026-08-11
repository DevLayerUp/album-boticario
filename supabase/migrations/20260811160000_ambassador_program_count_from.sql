-- Contagem da missão "Divulgue o álbum" começa do zero a partir deste instante.
-- Independente da missão "Convidar amigos" (que continua contando o histórico completo).
-- Só entram indicados com profiles.created_at >= ambassador_program_started_at
-- e cadastro completo (perfil preenchido).

insert into public.app_settings (key, value, updated_at)
values (
  'ambassador_program_started_at',
  to_char(timezone('utc', now()), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
  now()
)
on conflict (key) do update
set
  value = excluded.value,
  updated_at = now();

-- Zera progresso armazenado da missão de divulgação (reconcilia na próxima visita).
update public.user_missions um
set
  progress = 0,
  completed_at = null,
  reward_claimed = false
from public.missions m
where m.id = um.mission_id
  and m.title = 'Divulgue o álbum';

update public.missions
set
  instructions = 'Compartilhe seu link de convite. A contagem deste desafio começa do zero e é independente da missão Convidar amigos. Só contam amigos que se cadastrarem a partir do lançamento deste programa e concluírem o cadastro completo (perfil preenchido). Não há meta máxima — divulgue o máximo que puder. Os 3 colaboradores com mais convites válidos ganham a camiseta.'
where title = 'Divulgue o álbum';
