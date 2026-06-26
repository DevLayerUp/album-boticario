alter table public.stickers
  add column if not exists redirect_url text;

comment on column public.stickers.redirect_url is
  'Optional external URL shown as CTA on sticker back in album';
