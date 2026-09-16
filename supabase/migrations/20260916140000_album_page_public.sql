-- Páginas privadas só aparecem no álbum para usuários admin.
-- Páginas existentes permanecem públicas.

alter table public.album_pages
  add column if not exists is_public boolean not null default true;

comment on column public.album_pages.is_public is
  'false = visível apenas para admin no álbum; true = visível para todos.';

drop policy if exists "album_pages_read" on public.album_pages;
create policy "album_pages_read"
  on public.album_pages for select
  to anon, authenticated
  using (is_public = true or public.is_admin());
