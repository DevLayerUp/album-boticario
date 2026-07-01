-- =============================================================================
-- RESET PARA PRODUÇÃO — remove usuários de teste, mantém admin e conteúdo
-- =============================================================================
--
-- O que APAGA:
--   • Contas de teste (auth.users + profiles) — exceto admin(s)
--   • Todo progresso de jogo de TODOS, inclusive do admin enquanto jogador:
--     inventário, álbum, pacotinhos abertos, missões, quiz, trocas, notificações
--   • Arquivos no bucket storage "stickers" (pastas {userId}/), inclusive do admin
--   • Figurinha/avatar gerados no perfil do admin (sticker_url, avatar_url)
--   • Flags de progresso (primeiros passos, missão social, convite recebido)
--
-- O que MANTÉM no admin:
--   • Conta de login (auth.users) e role admin
--   • Cadastro: nome, e-mail, senha, username, referral_code, cidade, telefone, bio
--   • Catálogo: figurinhas, categorias, raridades, páginas/slots do álbum
--   • Missões e quizzes (definições + opções)
--   • Landing page e app (app_settings: landing_*, seo, album_cover, etc.)
--   • Avisos do admin (announcements)
--   • Storage: buckets "assets" e "landing" (imagens do admin/LP)
--
-- ⚠️  FAÇA BACKUP ANTES (Supabase Dashboard → Database → Backups).
-- ⚠️  Execute no SQL Editor com privilégios elevados (service role).
-- ⚠️  Rode primeiro a seção "PRÉ-VOO" abaixo e confira os números.
--
-- STORAGE (passo separado — SQL não pode apagar storage.objects):
--   node scripts/clear-stickers-storage.mjs --dry-run   # conferir
--   node scripts/clear-stickers-storage.mjs             # apagar arquivos
--
-- =============================================================================


-- =============================================================================
-- PRÉ-VOO — rode isto ANTES do reset e confira os números
-- =============================================================================
/*
with admin_emails(email) as (
  select unnest(array[
    'admin@albumboticario.com.br'
    -- adicione outros e-mails admin aqui, se necessário:
    -- , 'outro-admin@empresa.com.br'
  ]::text[])
),
admins as (
  select u.id, u.email
  from auth.users u
  left join admin_emails ae on lower(u.email) = lower(ae.email)
  where coalesce(u.raw_app_meta_data->>'role', '') = 'admin'
     or coalesce(u.raw_user_meta_data->>'role', '') = 'admin'
     or ae.email is not null
)
select 'admins_mantidos' as item, count(*)::bigint as qtd from admins
union all
select 'usuarios_a_apagar', count(*)::bigint
from auth.users u
where u.id not in (select id from admins)
union all
select 'profiles_a_apagar', count(*)::bigint
from public.profiles p
where p.id not in (select id from admins)
union all
select 'user_stickers', count(*)::bigint from public.user_stickers
union all
select 'packs', count(*)::bigint from public.packs
union all
select 'trade_requests', count(*)::bigint from public.trade_requests
union all
select 'notifications', count(*)::bigint from public.notifications
union all
select 'admin_packs', count(*)::bigint from public.packs p
  where p.user_id in (select id from admins)
union all
select 'admin_user_stickers', count(*)::bigint from public.user_stickers us
  where us.user_id in (select id from admins)
union all
select 'admin_user_missions', count(*)::bigint from public.user_missions um
  where um.user_id in (select id from admins)
order by item;
*/


-- =============================================================================
-- RESET — descomente / execute a partir daqui (após validar o pré-voo)
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 0. Identificar admin(s) a preservar
-- ---------------------------------------------------------------------------
create temporary table _admins_to_keep on commit drop as
with admin_emails(email) as (
  select unnest(array[
    'admin@albumboticario.com.br'
    -- adicione outros e-mails admin aqui, se necessário:
    -- , 'outro-admin@empresa.com.br'
  ]::text[])
)
select u.id, u.email
from auth.users u
left join admin_emails ae on lower(u.email) = lower(ae.email)
where coalesce(u.raw_app_meta_data->>'role', '') = 'admin'
   or coalesce(u.raw_user_meta_data->>'role', '') = 'admin'
   or ae.email is not null;

do $$
begin
  if (select count(*) from _admins_to_keep) = 0 then
    raise exception
      'Nenhum admin encontrado. Defina role=admin ou inclua o e-mail em admin_emails antes de continuar.';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 1. Zerar TODO progresso de jogo (inclui admin como jogador)
-- ---------------------------------------------------------------------------
truncate table public.trade_requests restart identity cascade;
truncate table public.trade_wishes restart identity cascade;
truncate table public.packs restart identity cascade;
truncate table public.user_album restart identity cascade;
truncate table public.user_stickers restart identity cascade;
truncate table public.user_missions restart identity cascade;
truncate table public.user_quiz_answers restart identity cascade;
truncate table public.notifications restart identity cascade;
truncate table public.announcement_reads restart identity cascade;

-- ---------------------------------------------------------------------------
-- 2. Remover contas de teste (cascade em profiles e dados ligados ao user_id)
--    Storage: rode scripts/clear-stickers-storage.mjs (API — não funciona via SQL)
-- ---------------------------------------------------------------------------
delete from auth.users
where id not in (select id from _admins_to_keep);

-- ---------------------------------------------------------------------------
-- 3. Resetar perfil do admin como jogador (mantém dados de cadastro)
-- ---------------------------------------------------------------------------
update public.profiles
set
  avatar_url               = null,
  sticker_url              = null,
  social_shared_at         = null,
  first_steps_completed_at = null,
  referred_by              = null,
  updated_at               = now()
where id in (select id from _admins_to_keep);

commit;


-- =============================================================================
-- VERIFICAÇÃO PÓS-RESET
-- =============================================================================

with admin_emails(email) as (
  select unnest(array[
    'admin@albumboticario.com.br'
  ]::text[])
),
admins as (
  select u.id, u.email
  from auth.users u
  left join admin_emails ae on lower(u.email) = lower(ae.email)
  where coalesce(u.raw_app_meta_data->>'role', '') = 'admin'
     or coalesce(u.raw_user_meta_data->>'role', '') = 'admin'
     or ae.email is not null
)
select 'auth.users (total)' as tabela, count(*)::bigint as registros
from auth.users
union all
select 'auth.users (admin)', count(*)::bigint from admins
union all
select 'profiles', count(*)::bigint from public.profiles
union all
select 'user_stickers', count(*)::bigint from public.user_stickers
union all
select 'user_album', count(*)::bigint from public.user_album
union all
select 'packs', count(*)::bigint from public.packs
union all
select 'pack_stickers', count(*)::bigint from public.pack_stickers
union all
select 'user_missions', count(*)::bigint from public.user_missions
union all
select 'user_quiz_answers', count(*)::bigint from public.user_quiz_answers
union all
select 'trade_requests', count(*)::bigint from public.trade_requests
union all
select 'trade_wishes', count(*)::bigint from public.trade_wishes
union all
select 'notifications', count(*)::bigint from public.notifications
union all
select 'announcement_reads', count(*)::bigint from public.announcement_reads
union all
select 'stickers (catálogo)', count(*)::bigint from public.stickers
union all
select 'missions (catálogo)', count(*)::bigint from public.missions
union all
select 'quizzes (catálogo)', count(*)::bigint from public.quizzes
union all
select 'app_settings', count(*)::bigint from public.app_settings
union all
select 'announcements', count(*)::bigint from public.announcements
union all
select 'storage stickers (objs)', count(*)::bigint
from storage.objects where bucket_id = 'stickers'
order by tabela;

-- Listar admin(s) preservado(s)
select id, email,
       coalesce(raw_app_meta_data->>'role', raw_user_meta_data->>'role') as role
from auth.users
where coalesce(raw_app_meta_data->>'role', '') = 'admin'
   or coalesce(raw_user_meta_data->>'role', '') = 'admin'
   or lower(email) = lower('admin@albumboticario.com.br');

-- Progresso do admin como jogador (todos devem ser 0 / null)
with admin_emails(email) as (
  select unnest(array['admin@albumboticario.com.br']::text[])
),
admins as (
  select u.id from auth.users u
  left join admin_emails ae on lower(u.email) = lower(ae.email)
  where coalesce(u.raw_app_meta_data->>'role', '') = 'admin'
     or coalesce(u.raw_user_meta_data->>'role', '') = 'admin'
     or ae.email is not null
)
select 'admin packs' as item, count(*)::bigint as qtd
from public.packs where user_id in (select id from admins)
union all
select 'admin figurinhas', count(*)::bigint
from public.user_stickers where user_id in (select id from admins)
union all
select 'admin missões', count(*)::bigint
from public.user_missions where user_id in (select id from admins)
union all
select 'admin quiz', count(*)::bigint
from public.user_quiz_answers where user_id in (select id from admins)
union all
select 'admin álbum', count(*)::bigint
from public.user_album where user_id in (select id from admins)
union all
select 'admin sticker_url', count(*)::bigint
from public.profiles where id in (select id from admins) and sticker_url is not null
union all
select 'admin avatar_url', count(*)::bigint
from public.profiles where id in (select id from admins) and avatar_url is not null
union all
select 'admin storage stickers', count(*)::bigint
from storage.objects
where bucket_id = 'stickers'
  and (storage.foldername(name))[1] in (select id::text from admins);
