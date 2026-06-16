INSERT INTO app_settings (key, value)
VALUES ('landing_how_it_works', NULL)
ON CONFLICT (key) DO NOTHING;
