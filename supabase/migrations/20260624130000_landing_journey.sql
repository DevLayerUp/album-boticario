INSERT INTO app_settings (key, value)
VALUES ('landing_journey', NULL)
ON CONFLICT (key) DO NOTHING;
