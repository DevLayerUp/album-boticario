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
  and m.title in ('Divulgue o álbum', 'Desafio GB: Divulgue o álbum');

update public.missions
set
  instructions = 'Compartilhe seu link de convite com amigos. Só contam cadastros feitos a partir do lançamento deste desafio, com perfil completo. Não há meta máxima — divulgue o máximo que puder. Os 3 colaboradores que mais trouxerem amigos para se tornarem Fãs por Natureza ganham a camiseta. Para mais informações, acesse o regulamento.'
where title in ('Divulgue o álbum', 'Desafio GB: Divulgue o álbum');
