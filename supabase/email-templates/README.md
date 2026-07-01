# Templates de e-mail transacionais (Resend)

HTML alinhados ao design system do projeto (verde `#0d6632`, amarelo `#deda00`, fundo `#f9f8f7`, Barlow).

Os envios são feitos pelo **Resend** no app Next.js — **não** pelo SMTP/templates do Dashboard Supabase.

## Arquivos

| Arquivo | Uso |
|---|---|
| `account-created.html` | Boas-vindas após cadastro |
| `reset-password.html` | Redefinir senha |

## Variáveis nos templates

| Placeholder | Substituído por |
|---|---|
| `{{ .SiteURL }}` | `NEXT_PUBLIC_SITE_URL` (logotipos no header) |
| `{{ .LoginURL }}` | `{{ .SiteURL }}/login` (apenas conta criada) |
| `{{ .DisplayName }}` | Nome do usuário com vírgula (ex.: `, Maria`) ou vazio |
| `{{ .ConfirmationURL }}` | Link de redefinição de senha (apenas reset) |

## Configuração

### 1. Variáveis de ambiente

```env
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL="Fãs por Natureza <noreply@seudominio.com.br>"
NEXT_PUBLIC_SITE_URL=https://www.faspornatureza.com.br
```

O domínio em `RESEND_FROM_EMAIL` precisa estar verificado no [Resend](https://resend.com/domains).

### 2. Supabase Auth — desativar confirmação por e-mail

Dashboard → **Authentication** → **Providers** → **Email**:

- Desative **Confirm email** (cadastro entra direto, sem link de confirmação do Supabase)
- **Não** configure o hook Send Email — os e-mails saem só pelo Resend

### 3. Conta criada — API dedicada

Após `signUp` em `/register` e `/register/senha`, o app chama:

`POST /api/auth/account-created` → envia `account-created.html` via Resend.

### 4. Redefinir senha — API dedicada

`/esqueci-senha` chama `POST /api/auth/password-reset`, que:

1. Gera o token com `auth.admin.generateLink` (recovery)
2. Envia `reset-password.html` via Resend com link no **domínio do app**:

   `https://www.faspornatureza.com.br/auth/recuperar-senha?token=...`

3. A rota `/auth/recuperar-senha` valida o token, abre a sessão e redireciona para `/redefinir-senha`

### 5. URLs de auth (Supabase)

- **Site URL** = produção (`NEXT_PUBLIC_SITE_URL`)
- **Redirect URLs** (Authentication → URL Configuration):
  - `https://SEU_DOMINIO/auth/callback`
  - `https://SEU_DOMINIO/auth/recuperar-senha`
  - `https://SEU_DOMINIO/redefinir-senha`
  - `http://localhost:3000/auth/callback` (dev)

## Assuntos dos e-mails

- **Conta criada:** `Conta criada — Fãs por Natureza`
- **Reset password:** `Redefinir sua senha — Fãs por Natureza`

Definidos em `lib/email/templates.ts`.

## Logotipos

Referenciados como `{{ .SiteURL }}/images/dashboard/logo-fgb.png` e `logo-branco.png`.
Certifique-se de que esses arquivos estão publicados no domínio de produção.
