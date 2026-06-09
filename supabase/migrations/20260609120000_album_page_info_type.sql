-- =============================================================
-- Migration — Add info-page support to album_pages
-- Adds page_type ('sticker' | 'info') and rich-text content field
-- =============================================================

alter table public.album_pages
  add column if not exists page_type text not null default 'sticker',
  add column if not exists content   text;

comment on column public.album_pages.page_type is
  'sticker = grid de figurinhas; info = página informativa com imagem + HTML';
comment on column public.album_pages.content is
  'HTML do conteúdo da página informativa (sanitizado no admin antes de salvar)';
