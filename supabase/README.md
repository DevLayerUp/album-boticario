# 🗄️ SQL / Supabase

Migrações do banco do **Álbum de Figurinhas — Grupo Boticário**, prontas para executar.

## Ordem das migrations (`supabase/migrations/`)

| Arquivo | Conteúdo |
|---|---|
| `20260608090000_schema.sql` | Tabelas, seed de raridades, índices |
| `20260608090100_functions_triggers.sql` | `handle_new_user`, `set_updated_at`, `is_admin` |
| `20260608090200_rls.sql` | RLS habilitado + policies (usuário, conteúdo, trocas, admin) |
| `20260608090300_storage.sql` | Buckets `stickers` e `assets` + policies |

`seed.sql` traz dados de exemplo (opcional, apenas dev).

---

## Forma 1 — SQL Editor (mais rápido)

1. Abra o projeto no [dashboard Supabase](https://supabase.com/dashboard) → **SQL Editor**.
2. Cole e rode o conteúdo de cada arquivo **na ordem da tabela acima**.
3. (Opcional) Rode `seed.sql` para dados de teste.

## Forma 2 — Supabase CLI (recomendado para versionar)

```bash
# 1. Login e link com o projeto remoto
supabase login
supabase link --project-ref <SEU_PROJECT_REF>

# 2. Aplicar as migrations no banco remoto
supabase db push

# Local (Docker): aplica migrations + seed.sql
supabase db reset
```

> Se ainda não houver `config.toml`, rode `supabase init` na raiz do projeto antes
> do `link` (mantenha a pasta `supabase/migrations` existente).

---

## Notas de segurança / design

- **RLS em todas as tabelas** do schema `public`. Conteúdo (catálogo) é
  legível por todos; escrita só por **admin** (`is_admin()` lê o `role` do JWT).
- **`is_admin()`** prioriza `app_metadata.role` (não editável pelo usuário) e
  cai para `user_metadata.role`. Defina o role via Admin API/Dashboard.
- **Geração de packs / trocas** roda no servidor com **`service_role`**, que
  ignora RLS por design — as policies protegem o acesso direto via anon key.
- **`pack_stickers`** é legível apenas pelo dono do pack (via `exists` em `packs`).
- **Storage**: usuário só envia para `stickers/{uid}/...`; `assets` é escrita por admin.
