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
      'Divulgue o álbum',
      'Os 3 colaboradores que mais trouxerem amigos para se tornarem Fãs por Natureza ganham uma camiseta. Convide sem limite!',
      'custom',
      null::int,
      0,
      0,
      'gold',
      'Compartilhe seu link de convite. Só contam amigos que concluírem o cadastro completo (perfil preenchido). Não há meta máxima — divulgue o máximo que puder. Os 3 colaboradores com mais convites válidos ganham a camiseta.',
      'Convidar Amigos',
      '/dashboard#convidar-amigos',
      'cadastros',
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
  select 1 from public.missions m where m.title = seed.title
);
