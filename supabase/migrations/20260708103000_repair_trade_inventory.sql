-- Recalcula user_stickers a partir de pacotes abertos + trocas aceitas.
-- Corrige cópias fantasma (ex.: repetida ainda negociável após troca, ou quantity
-- inflada pela migration repair_paste_decremented_quantity / bug de RLS legado).

WITH sticker_events AS (
  SELECT p.user_id, ps.sticker_id, 1 AS delta
  FROM public.packs p
  INNER JOIN public.pack_stickers ps ON ps.pack_id = p.id
  WHERE p.opened_at IS NOT NULL

  UNION ALL

  SELECT t.requester_id, t.offered_sticker_id, -1
  FROM public.trade_requests t
  WHERE t.status = 'accepted' AND t.offered_sticker_id IS NOT NULL

  UNION ALL

  SELECT t.requester_id, t.requested_sticker_id, 1
  FROM public.trade_requests t
  WHERE t.status = 'accepted' AND t.requested_sticker_id IS NOT NULL

  UNION ALL

  SELECT t.receiver_id, t.offered_sticker_id, 1
  FROM public.trade_requests t
  WHERE t.status = 'accepted' AND t.offered_sticker_id IS NOT NULL

  UNION ALL

  SELECT t.receiver_id, t.requested_sticker_id, -1
  FROM public.trade_requests t
  WHERE t.status = 'accepted' AND t.requested_sticker_id IS NOT NULL
),
expected AS (
  SELECT
    user_id,
    sticker_id,
    GREATEST(SUM(delta), 0)::int AS expected_qty
  FROM sticker_events
  GROUP BY user_id, sticker_id
  HAVING SUM(delta) > 0
),
correct_overstated AS (
  UPDATE public.user_stickers us
  SET quantity = e.expected_qty
  FROM expected e
  WHERE us.user_id = e.user_id
    AND us.sticker_id = e.sticker_id
    AND us.quantity > e.expected_qty
  RETURNING us.id
),
insert_missing AS (
  INSERT INTO public.user_stickers (user_id, sticker_id, quantity)
  SELECT e.user_id, e.sticker_id, e.expected_qty
  FROM expected e
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.user_stickers us
    WHERE us.user_id = e.user_id
      AND us.sticker_id = e.sticker_id
  )
  ON CONFLICT (user_id, sticker_id) DO NOTHING
  RETURNING id
),
correct_understated AS (
  UPDATE public.user_stickers us
  SET quantity = e.expected_qty
  FROM expected e
  WHERE us.user_id = e.user_id
    AND us.sticker_id = e.sticker_id
    AND us.quantity < e.expected_qty
  RETURNING us.id
),
remove_phantom AS (
  DELETE FROM public.user_stickers us
  WHERE us.quantity <= 0
     OR NOT EXISTS (
       SELECT 1
       FROM expected e
       WHERE e.user_id = us.user_id
         AND e.sticker_id = us.sticker_id
     )
  RETURNING us.id
)
SELECT
  (SELECT COUNT(*) FROM correct_overstated) AS fixed_overstated,
  (SELECT COUNT(*) FROM correct_understated) AS fixed_understated,
  (SELECT COUNT(*) FROM insert_missing) AS inserted_missing,
  (SELECT COUNT(*) FROM remove_phantom) AS removed_phantom;
