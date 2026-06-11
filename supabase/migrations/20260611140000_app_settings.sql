-- App-wide key/value settings table
-- Used for global configuration such as the album cover image URL.

CREATE TABLE IF NOT EXISTS app_settings (
  key        text PRIMARY KEY,
  value      text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed the album cover key so it always exists for a simple SELECT … LIMIT 1
INSERT INTO app_settings (key, value)
VALUES ('album_cover_url', null)
ON CONFLICT (key) DO NOTHING;

-- RLS: anyone authenticated can read; only service_role (admin API) can write
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read"
  ON app_settings FOR SELECT
  USING (true);

CREATE POLICY "admin write"
  ON app_settings FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
