-- Figurinha promocional: permanece bloqueada até a data de revelação.

alter table public.stickers
  add column if not exists promotion_enabled boolean not null default false,
  add column if not exists promotion_unlocks_at timestamptz,
  add column if not exists promotion_message text;

comment on column public.stickers.promotion_enabled is
  'Quando true, a figurinha fica bloqueada (visual + fora do drop) até promotion_unlocks_at.';

comment on column public.stickers.promotion_unlocks_at is
  'Momento em que a figurinha promocional entra no drop e pode ser colada.';

comment on column public.stickers.promotion_message is
  'Texto exibido no hover/toque enquanto a figurinha promocional está bloqueada.';
