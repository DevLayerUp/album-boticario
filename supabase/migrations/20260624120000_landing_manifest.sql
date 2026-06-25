INSERT INTO app_settings (key, value)
VALUES ('landing_manifest', NULL)
ON CONFLICT (key) DO NOTHING;
