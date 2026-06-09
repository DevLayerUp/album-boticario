-- =============================================================
-- Seed opcional — dados de exemplo para desenvolvimento
-- Rode manualmente no SQL Editor ou via `supabase db reset` (que
-- aplica migrations + seed). Seguro para reexecução (on conflict).
-- =============================================================

-- Categorias de exemplo
insert into public.sticker_categories (name, description, sort_order) values
  ('O Boticário', 'Linha clássica O Boticário', 1),
  ('Natura',      'Produtos Natura',            2),
  ('Eudora',      'Coleção Eudora',             3)
on conflict do nothing;

-- Observações:
--  * As raridades já são populadas pela migration de schema.
--  * Figurinhas, páginas e slots devem ser criados pelo Admin Dashboard
--    (Etapa 3) ou inseridos aqui conforme necessário para testes.
