-- ============================================================
-- Migration: adiciona layout_template em album_pages
-- Permite que cada página do álbum tenha um grid configurado
-- ============================================================

ALTER TABLE public.album_pages
  ADD COLUMN IF NOT EXISTS layout_template text NOT NULL DEFAULT '3x3';

COMMENT ON COLUMN public.album_pages.layout_template IS
  'Template de grid da página: "2x2", "2x3", "3x3", "2x4", "3x4", "4x4"';
