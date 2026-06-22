-- Corrige link legado da missão "Criar figurinha personalizada" (/colecao → /figurinha).

update public.missions
set action_href = '/figurinha'
where title = 'Criar figurinha personalizada'
  and (action_href is null or action_href = '/colecao');
