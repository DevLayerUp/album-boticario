-- Missões padrão do layout Figma (idempotente por título).

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
      'Criar figurinha personalizada',
      'Crie sua figurinha personalizada com sua foto e entre para a coleção.',
      'custom',
      1,
      1,
      100,
      'green',
      'Acesse a área de criação de figurinha, envie sua foto e finalize sua figurinha personalizada.',
      'Criar Figurinha',
      '/figurinha',
      null::text,
      1,
      true
    ),
    (
      'Completar perfil',
      'Preencha todas as informações do seu perfil de colecionador.',
      'custom',
      1,
      1,
      100,
      'blue',
      'Complete seu nome, foto e demais dados na página de perfil.',
      'Completar Perfil',
      '/perfil',
      null::text,
      2,
      true
    ),
    (
      'Fazer 5 trocas',
      'Realize 5 trocas de figurinhas com outros colecionadores.',
      'trade_count',
      5,
      1,
      100,
      'brown',
      'Troque figurinhas repetidas com outros usuários até completar 5 trocas aceitas.',
      'Ir para Trocas',
      '/trocas',
      'trocas',
      3,
      true
    ),
    (
      'Acertar 5 quizzes',
      'Responda corretamente 5 quizzes do dia.',
      'quiz_streak',
      5,
      1,
      100,
      'blue',
      'Acesse o Quiz do Dia e acerte as perguntas para avançar nesta missão.',
      'Responder Quiz',
      '/quiz',
      'quizzes',
      4,
      true
    ),
    (
      'Convidar amigos',
      'Convide 4 amigos para participar da plataforma.',
      'custom',
      4,
      1,
      100,
      'brown',
      'Compartilhe seu convite com amigos e incentive-os a criar uma conta.',
      'Convidar Amigos',
      '/perfil',
      'convites',
      5,
      true
    ),
    (
      'Compartilhar nas redes',
      'Compartilhe sua coleção nas redes sociais.',
      'custom',
      1,
      1,
      100,
      'green',
      'Publique seu álbum ou figurinha nas redes sociais e marque a campanha.',
      'Compartilhar',
      '/album',
      null::text,
      6,
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
