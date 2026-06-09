-- =============================================================
-- Migration 04 — Storage buckets + policies
-- =============================================================

-- Buckets públicos para leitura (URLs públicas das imagens)
insert into storage.buckets (id, name, public)
values ('stickers', 'stickers', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('assets', 'assets', true)   -- moldura, imagens cadastradas pelo admin
on conflict (id) do nothing;

-- -------------------------------------------------------------
-- bucket "stickers"
--  upload apenas na própria pasta ({uid}/arquivo.png); leitura pública
-- -------------------------------------------------------------
drop policy if exists "stickers_upload_own" on storage.objects;
create policy "stickers_upload_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'stickers'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "stickers_update_own" on storage.objects;
create policy "stickers_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'stickers'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'stickers'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "stickers_delete_own" on storage.objects;
create policy "stickers_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'stickers'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "stickers_read_all" on storage.objects;
create policy "stickers_read_all"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'stickers');

-- -------------------------------------------------------------
-- bucket "assets"
--  leitura pública; escrita apenas admin
-- -------------------------------------------------------------
drop policy if exists "assets_read_all" on storage.objects;
create policy "assets_read_all"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'assets');

drop policy if exists "assets_admin_write" on storage.objects;
create policy "assets_admin_write"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'assets' and public.is_admin())
  with check (bucket_id = 'assets' and public.is_admin());
