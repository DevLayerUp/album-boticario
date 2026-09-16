-- Figurinhas privadas só aparecem no álbum e na galeria para usuários admin.
-- Figurinhas existentes permanecem públicas.

alter table public.stickers
  add column if not exists is_public boolean not null default true;

comment on column public.stickers.is_public is
  'false = visível apenas para admin no álbum e na galeria; true = visível para todos.';

drop policy if exists "stickers_read" on public.stickers;
create policy "stickers_read"
  on public.stickers for select
  to anon, authenticated
  using (is_public = true or public.is_admin());
