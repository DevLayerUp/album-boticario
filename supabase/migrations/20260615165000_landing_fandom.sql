INSERT INTO app_settings (key, value)
VALUES ('landing_fandom', NULL)
ON CONFLICT (key) DO NOTHING;
