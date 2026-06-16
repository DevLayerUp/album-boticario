-- Seed landing page settings keys in app_settings table
INSERT INTO app_settings (key, value)
VALUES
  ('landing_navbar', NULL),
  ('landing_hero', NULL)
ON CONFLICT (key) DO NOTHING;

-- Create landing images bucket (public read, admin write)
INSERT INTO storage.buckets (id, name, public)
VALUES ('landing', 'landing', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for landing bucket
DROP POLICY IF EXISTS "landing_read_all" ON storage.objects;
CREATE POLICY "landing_read_all"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'landing');

DROP POLICY IF EXISTS "landing_admin_write" ON storage.objects;
CREATE POLICY "landing_admin_write"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'landing' AND public.is_admin())
  WITH CHECK (bucket_id = 'landing' AND public.is_admin());
