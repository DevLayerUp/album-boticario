INSERT INTO app_settings (key, value)
VALUES ('landing_register', NULL)
ON CONFLICT (key) DO NOTHING;
