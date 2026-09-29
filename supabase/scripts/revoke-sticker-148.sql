-- =============================================================================
-- Revoga a figurinha 148 de todos os usuários
-- Motivo: entrou no drop / resgate antes da hora.
-- NÃO apaga a figurinha do catálogo — só o que os usuários já receberam.
--
-- O que remove:
--   • inventário (user_stickers)
--   • colagem no álbum (user_album)
--   • pedidos de troca abertos (trade_wishes)
--   • trocas PENDENTES que envolvem a 148
--
-- O que NÃO mexe:
--   • cadastro da figurinha 148
--   • slot do álbum
--   • pacotinhos já abertos (só tira do inventário)
--   • ranking em cache (rode o backfill depois, se quiser)
--
-- Como usar:
--   1. Backup (Supabase → Database → Backups)
--   2. Rode o PRÉ-VOO e confira os números
--   3. Rode o BLOCO DE EXECUÇÃO inteiro de uma vez (é uma transação)
-- =============================================================================

-- =============================================================================
-- PRÉ-VOO — só leitura
-- =============================================================================

select
  s.id,
  s.name,
  s.is_public,
  s.promotion_enabled,
  s.promotion_unlocks_at
from public.stickers s
where s.id = 148;

select 'user_stickers' as origem, count(*) as linhas, coalesce(sum(quantity), 0) as quantidade
from public.user_stickers
where sticker_id = 148
union all
select 'user_album', count(*), count(*)
from public.user_album
where sticker_id = 148
   or slot_id in (select id from public.album_slots where sticker_id = 148)
union all
select 'trade_wishes_open', count(*), count(*)
from public.trade_wishes
where sticker_id = 148 and status = 'open'
union all
select 'trades_pending', count(*), count(*)
from public.trade_requests
where status = 'pending'
  and (offered_sticker_id = 148 or requested_sticker_id = 148)
union all
select 'pack_stickers_unopened', count(*), count(*)
from public.pack_stickers ps
join public.packs p on p.id = ps.pack_id
where ps.sticker_id = 148
  and p.opened_at is null;


-- =============================================================================
-- EXECUÇÃO — rode só depois de conferir o pré-voo
-- =============================================================================

begin;

  -- Trocas ainda não resolvidas: cancela para não entregar a 148 de novo
  update public.trade_requests
  set status = 'cancelled',
      resolved_at = now()
  where status = 'pending'
    and (offered_sticker_id = 148 or requested_sticker_id = 148);

  delete from public.trade_wishes
  where sticker_id = 148
    and status = 'open';

  -- Tira do álbum (colada)
  delete from public.user_album
  where sticker_id = 148
     or slot_id in (select id from public.album_slots where sticker_id = 148);

  -- Tira do inventário
  delete from public.user_stickers
  where sticker_id = 148;

  -- Pacotinhos AINDA FECHADOS que já saíram com a 148: remove a carta
  -- (o pacote fica com 4 figurinhas em vez de 5)
  delete from public.pack_stickers ps
  using public.packs p
  where ps.pack_id = p.id
    and ps.sticker_id = 148
    and p.opened_at is null;

commit;


-- Conferência
select 'user_stickers' as origem, count(*) as restante
from public.user_stickers where sticker_id = 148
union all
select 'user_album', count(*)
from public.user_album
where sticker_id = 148
   or slot_id in (select id from public.album_slots where sticker_id = 148);
