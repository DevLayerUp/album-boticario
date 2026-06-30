-- Restaura quantity perdida quando colar decrementava o inventário (comportamento legado).
-- Só corrige quando o histórico de pacotes prova que o usuário abriu a figurinha 2+ vezes
-- e o inventário ficou em 1 após colar no álbum.

WITH acquired AS (
  SELECT
    p.user_id,
    ps.sticker_id,
    COUNT(*)::int AS cnt
  FROM packs p
  INNER JOIN pack_stickers ps ON ps.pack_id = p.id
  WHERE p.opened_at IS NOT NULL
  GROUP BY p.user_id, ps.sticker_id
),
pasted AS (
  SELECT DISTINCT
    ua.user_id,
    COALESCE(ua.sticker_id, s.sticker_id) AS sticker_id
  FROM user_album ua
  INNER JOIN album_slots s ON s.id = ua.slot_id
  WHERE COALESCE(ua.sticker_id, s.sticker_id) IS NOT NULL
)
UPDATE user_stickers us
SET quantity = us.quantity + 1
FROM acquired a
INNER JOIN pasted p
  ON p.user_id = a.user_id
  AND p.sticker_id = a.sticker_id
WHERE us.user_id = a.user_id
  AND us.sticker_id = a.sticker_id
  AND a.cnt >= 2
  AND us.quantity = 1;
