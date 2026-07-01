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

---

## Recuperação de senha (Auth)

O fluxo usa **Supabase Auth** (`generateLink` + sessão no callback + `updateUser`). Os e-mails saem pelo **Resend** com os templates em `supabase/email-templates/`.

1. **Authentication → URL Configuration**
   - **Site URL**: URL de produção (ex.: `https://seu-dominio.com`)
   - **Redirect URLs** (adicione todas as origens usadas):
     - `http://localhost:3000/auth/callback`
     - `https://seu-dominio.com/auth/callback`

2. **Variáveis de ambiente** — `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (ver `supabase/email-templates/README.md`).

3. **Fluxo no app**
   - Cadastro (`/register`, `/register/senha`) → `POST /api/auth/account-created` → e-mail Resend com `account-created.html`
   - `/esqueci-senha` → `POST /api/auth/password-reset` → e-mail Resend com `reset-password.html`
   - Callback troca o `code` por sessão e redireciona para `/redefinir-senha`
   - Usuário define nova senha com `auth.updateUser({ password })`

Em desenvolvimento local, use `http://localhost:3000` como Site URL ou inclua localhost nas Redirect URLs.

---

## Templates de e-mail (Auth)

HTML em `supabase/email-templates/` — enviados via **Resend**, não pelo Dashboard Supabase.

| Template | Arquivo | Disparo |
|---|---|---|
| Conta criada | `account-created.html` | `POST /api/auth/account-created` (após `signUp`) |
| Redefinir senha | `reset-password.html` | `POST /api/auth/password-reset` |

Configuração completa: `supabase/email-templates/README.md`.
