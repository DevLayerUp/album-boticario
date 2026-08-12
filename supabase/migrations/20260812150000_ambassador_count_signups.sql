-- Desafio GB: conta cadastros (conta criada via convite), não perfil completo.

update public.missions
set
  description = 'Os 3 colaboradores que mais trouxerem amigos para se tornarem Fãs por Natureza ganham uma camiseta. Contam cadastros via convite a partir do lançamento — sem meta máxima.',
  instructions = 'Compartilhe seu link de convite com amigos. Só contam cadastros feitos a partir do lançamento deste desafio (conta criada via seu convite). Não há meta máxima — divulgue o máximo que puder. Os 3 colaboradores que mais trouxerem amigos para se tornarem Fãs por Natureza ganham a camiseta. Para mais informações, acesse o regulamento.',
  progress_unit = 'cadastros'
where title in ('Divulgue o álbum', 'Desafio GB: Divulgue o álbum');
