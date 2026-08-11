-- Renomeia a missão de divulgação e atualiza copy + tema.

update public.missions
set
  title = 'Desafio GB: Divulgue o álbum',
  description = 'Os 3 colaboradores que mais trouxerem amigos para se tornarem Fãs por Natureza ganham uma camiseta. Convide sem limite!',
  theme = 'gold',
  reward_packs = 0,
  reward_points = 0,
  instructions = 'Compartilhe seu link de convite com amigos. Só contam cadastros feitos a partir do lançamento deste desafio, com perfil completo. Não há meta máxima — divulgue o máximo que puder. Os 3 colaboradores que mais trouxerem amigos para se tornarem Fãs por Natureza ganham a camiseta. Para mais informações, acesse o regulamento.',
  progress_unit = 'perfis'
where title in ('Divulgue o álbum', 'Desafio GB: Divulgue o álbum');
