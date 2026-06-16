INSERT INTO app_settings (key, value)
VALUES ('landing_faq', NULL)
ON CONFLICT (key) DO NOTHING;
