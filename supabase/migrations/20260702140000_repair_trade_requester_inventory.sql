-- Repara inventário do proponente (requester) em trocas aceitas após bug de RLS:
-- o receptor conseguia atualizar só o próprio inventário; o proponente não recebia a figurinha.

WITH broken_trades AS (
  SELECT
    t.id,
    t.requester_id,
    t.receiver_id,
    t.requested_sticker_id,
    t.offered_sticker_id
  FROM trade_requests t
  WHERE t.status = 'accepted'
    AND t.requested_sticker_id IS NOT NULL
    AND t.offered_sticker_id IS NOT NULL
    -- receptor recebeu a figurinha oferecida (lado dele da troca aplicou)
    AND EXISTS (
      SELECT 1
      FROM user_stickers ur
      WHERE ur.user_id = t.receiver_id
        AND ur.sticker_id = t.offered_sticker_id
        AND ur.quantity >= 1
    )
    -- proponente não recebeu a figurinha pedida
    AND NOT EXISTS (
      SELECT 1
      FROM user_stickers us
      WHERE us.user_id = t.requester_id
        AND us.sticker_id = t.requested_sticker_id
        AND us.quantity >= 1
    )
),
grant_received AS (
  INSERT INTO user_stickers (user_id, sticker_id, quantity)
  SELECT requester_id, requested_sticker_id, 1
  FROM broken_trades
  ON CONFLICT (user_id, sticker_id) DO UPDATE
    SET quantity = user_stickers.quantity + 1
  RETURNING user_id, sticker_id
),
decrement_offered AS (
  UPDATE user_stickers us
  SET quantity = us.quantity - 1
  FROM broken_trades bt
  WHERE us.user_id = bt.requester_id
    AND us.sticker_id = bt.offered_sticker_id
    AND us.quantity >= 1
  RETURNING us.id
)
DELETE FROM user_stickers
WHERE quantity <= 0;
