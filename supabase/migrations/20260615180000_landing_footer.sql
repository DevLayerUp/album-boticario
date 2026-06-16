INSERT INTO app_settings (key, value)
VALUES ('landing_footer', NULL)
ON CONFLICT (key) DO NOTHING;
