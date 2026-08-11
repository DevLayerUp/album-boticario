-- Missão exclusiva de colaboradores: divulgação sem meta máxima e sem recompensa in-app.
-- Visibilidade por domínio de e-mail é aplicada na API (não no banco).

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
  is_active
)
select *
from (
  values
    (
      'Desafio GB: Divulgue o álbum',
      'Os 3 colaboradores que mais trouxerem amigos para se tornarem Fãs por Natureza ganham uma camiseta. Convide sem limite!',
      'custom',
      null::int,
      0,
      0,
      'gold',
      'Compartilhe seu link de convite com amigos. Só contam cadastros feitos a partir do lançamento deste desafio, com perfil completo. Não há meta máxima — divulgue o máximo que puder. Os 3 colaboradores que mais trouxerem amigos para se tornarem Fãs por Natureza ganham a camiseta. Para mais informações, acesse o regulamento.',
      'Convidar Amigos',
      '/dashboard#convidar-amigos',
      'perfis',
      0,
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
  is_active
)
where not exists (
  select 1
  from public.missions m
  where m.title in ('Desafio GB: Divulgue o álbum', 'Divulgue o álbum')
);
