-- Favicon padrão em SVG (site + BIMI)
UPDATE public.app_settings
SET value = jsonb_set(value::jsonb, '{faviconUrl}', '"/images/favicon.svg"')
WHERE key = 'seo_settings'
  AND value::jsonb ->> 'faviconUrl' = '/images/favicon.png';
