-- Reconcilia progresso de missões com a atividade real (somente sem resgate).
-- Não remove recompensas já concedidas (reward_claimed = true).
-- Seguro para produção: apenas limpa completed_at inválido e sincroniza progress.

WITH mission_actual AS (
  SELECT
    um.id AS user_mission_id,
    um.user_id,
    um.mission_id,
    m.target_value,
    LEAST(
      COALESCE(m.target_value, 1),
      GREATEST(
        0,
        CASE m.id
          WHEN 1 THEN CASE WHEN p.sticker_url IS NOT NULL THEN 1 ELSE 0 END
          WHEN 2 THEN CASE
            WHEN p.display_name IS NOT NULL AND btrim(p.display_name) <> ''
              AND p.bio IS NOT NULL AND btrim(p.bio) <> ''
              AND p.phone IS NOT NULL AND btrim(p.phone) <> ''
              AND (p.avatar_url IS NOT NULL OR p.sticker_url IS NOT NULL)
            THEN 1 ELSE 0
          END
          WHEN 3 THEN (
            SELECT COUNT(*)::int
            FROM trade_requests t
            WHERE t.status = 'accepted'
              AND (t.requester_id = um.user_id OR t.receiver_id = um.user_id)
          )
          WHEN 4 THEN (
            SELECT COUNT(*)::int
            FROM user_quiz_answers q
            WHERE q.user_id = um.user_id AND q.is_correct = true
          )
          WHEN 5 THEN (
            SELECT COUNT(*)::int
            FROM profiles r
            WHERE r.referred_by = um.user_id
          )
          WHEN 6 THEN CASE WHEN p.social_shared_at IS NOT NULL THEN 1 ELSE 0 END
          ELSE 0
        END
      )
    ) AS actual_progress
  FROM user_missions um
  INNER JOIN missions m ON m.id = um.mission_id AND m.is_active = true
  INNER JOIN profiles p ON p.id = um.user_id
  WHERE um.reward_claimed = false
)
UPDATE user_missions um
SET
  progress = ma.actual_progress,
  completed_at = CASE
    WHEN ma.actual_progress >= COALESCE(ma.target_value, 1) THEN COALESCE(um.completed_at, now())
    ELSE NULL
  END
FROM mission_actual ma
WHERE um.id = ma.user_mission_id
  AND (
    um.progress IS DISTINCT FROM ma.actual_progress
    OR (
      ma.actual_progress < COALESCE(ma.target_value, 1)
      AND um.completed_at IS NOT NULL
    )
    OR (
      ma.actual_progress >= COALESCE(ma.target_value, 1)
      AND um.completed_at IS NULL
    )
  );
