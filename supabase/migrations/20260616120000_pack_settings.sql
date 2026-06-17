INSERT INTO app_settings (key, value)
VALUES
  ('pack_image_url', null),
  ('pack_opening_gif_url', null)
ON CONFLICT (key) DO NOTHING;
