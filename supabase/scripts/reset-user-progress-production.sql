-- =============================================================================
-- RESET DE PROGRESSO — preparar base para produção
-- =============================================================================
--
-- O que ZERA (todos os usuários):
--   • Inventário de figurinhas (user_stickers)
--   • Figurinhas coladas no álbum (user_album)
--   • Pacotinhos e conteúdo (packs, pack_stickers)
--   • Missões concluídas / progresso (user_missions)
--   • Trocas e pedidos (trade_requests, trade_wishes)
--   • Respostas de quiz (user_quiz_answers)
--   • Notificações de jogo (trade, quiz, missão)
--   • Figurinha personalizada no perfil (sticker_url)
--   • Flags de missão social e primeiros passos
--
-- O ranking é calculado em tempo real — ao limpar as tabelas acima, zera junto.
--
-- O que NÃO mexe:
--   • Contas (auth.users, profiles — nome, e-mail, senha, avatar_url, bio)
--   • Catálogo admin (stickers, categorias, páginas, slots, missões, quizzes)
--   • Convites (referred_by, referral_code)
--   • Avisos do admin (announcements)
--   • Configurações do app (app_settings)
--
-- ⚠️  EXECUTE UMA VEZ, EM PRODUÇÃO, COM BACKUP PRÉVIO.
--     Supabase Dashboard → SQL Editor → cole e rode como service role.
--
-- ⚠️  STORAGE: este SQL não apaga arquivos em storage/stickers/{userId}/.
--     Limpe o bucket "stickers" no Dashboard (Storage) ou rode script separado.
--
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. Trocas
-- ---------------------------------------------------------------------------
truncate table public.trade_requests restart identity cascade;

truncate table public.trade_wishes restart identity cascade;

-- ---------------------------------------------------------------------------
-- 2. Pacotinhos (pack_stickers some em cascata com packs)
-- ---------------------------------------------------------------------------
truncate table public.packs restart identity cascade;

-- ---------------------------------------------------------------------------
-- 3. Álbum e inventário
-- ---------------------------------------------------------------------------
truncate table public.user_album restart identity cascade;

truncate table public.user_stickers restart identity cascade;

-- ---------------------------------------------------------------------------
-- 4. Missões e quiz
-- ---------------------------------------------------------------------------
truncate table public.user_missions restart identity cascade;

truncate table public.user_quiz_answers restart identity cascade;

-- ---------------------------------------------------------------------------
-- 5. Notificações geradas pelo jogo (mantém type = announcement se houver)
-- ---------------------------------------------------------------------------
delete from public.notifications
where type in (
  'trade_request',
  'trade_accepted',
  'trade_rejected',
  'quiz_available',
  'mission_complete'
);

-- ---------------------------------------------------------------------------
-- 6. Perfil — figurinha personalizada e flags de progresso
-- ---------------------------------------------------------------------------
update public.profiles
set
  sticker_url                = null,
  social_shared_at           = null,
  first_steps_completed_at   = null,
  updated_at                 = now();

commit;

-- ---------------------------------------------------------------------------
-- Verificação pós-reset (todas devem retornar 0)
-- ---------------------------------------------------------------------------
select 'user_stickers'      as tabela, count(*)::bigint as registros from public.user_stickers
union all
select 'user_album',         count(*)::bigint from public.user_album
union all
select 'packs',              count(*)::bigint from public.packs
union all
select 'pack_stickers',      count(*)::bigint from public.pack_stickers
union all
select 'user_missions',      count(*)::bigint from public.user_missions
union all
select 'trade_requests',     count(*)::bigint from public.trade_requests
union all
select 'trade_wishes',       count(*)::bigint from public.trade_wishes
union all
select 'user_quiz_answers',  count(*)::bigint from public.user_quiz_answers
union all
select 'profiles_com_sticker', count(*)::bigint from public.profiles where sticker_url is not null
order by tabela;
