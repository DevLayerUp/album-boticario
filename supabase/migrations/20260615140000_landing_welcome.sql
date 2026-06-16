INSERT INTO app_settings (key, value)
VALUES ('landing_welcome', NULL)
ON CONFLICT (key) DO NOTHING;
