# Templates de e-mail transacionais (Resend)

HTML alinhados ao design system do projeto (verde `#0d6632`, amarelo `#deda00`, fundo `#f9f8f7`, Barlow).

Os envios são feitos pelo **Resend** no app Next.js — **não** pelo SMTP/templates do Dashboard Supabase.

## Arquivos

| Arquivo | Uso |
|---|---|
| `confirm-signup.html` | Confirmação de conta (cadastro) |
| `reset-password.html` | Redefinir senha |

## Variáveis nos templates

| Placeholder | Substituído por |
|---|---|
| `{{ .ConfirmationURL }}` | Link de confirmação ou redefinição |
| `{{ .SiteURL }}` | `NEXT_PUBLIC_SITE_URL` (logotipos no header) |

Não remova `{{ .ConfirmationURL }}` — é obrigatório para o fluxo de auth.

## Configuração

### 1. Variáveis de ambiente

```env
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL="Fãs da Natureza <noreply@seudominio.com.br>"
NEXT_PUBLIC_SITE_URL=https://www.faspornatureza.com.br

# Secret do hook Send Email (Supabase → Authentication → Hooks)
SEND_EMAIL_HOOK_SECRET=v1,whsec_...
```

O domínio em `RESEND_FROM_EMAIL` precisa estar verificado no [Resend](https://resend.com/domains).

### 2. Confirmação de cadastro — Auth Hook

1. Supabase Dashboard → **Authentication** → **Hooks** → **Send Email** → habilitar.
2. URL: `https://SEU_DOMINIO/api/auth/hooks/send-email`
3. Gere o secret e copie para `SEND_EMAIL_HOOK_SECRET`.
4. Desative envio SMTP padrão do Supabase (o hook substitui os templates do Dashboard).

Fluxos que disparam o hook:

- `signUp` em `/register` e `/register/senha`
- Qualquer confirmação de e-mail do Supabase Auth

### 3. Redefinir senha — API dedicada

`/esqueci-senha` chama `POST /api/auth/password-reset`, que:

1. Gera o link com `auth.admin.generateLink` (recovery)
2. Envia `reset-password.html` via Resend

Não usa mais `resetPasswordForEmail` do cliente.

### 4. URLs de auth (Supabase)

- **Site URL** = produção (`NEXT_PUBLIC_SITE_URL`)
- **Redirect URLs**: `https://SEU_DOMINIO/auth/callback` e `http://localhost:3000/auth/callback`

## Assuntos dos e-mails

- **Confirm signup:** `Confirme sua conta — Fãs da Natureza`
- **Reset password:** `Redefinir sua senha — Fãs da Natureza`

Definidos em `lib/email/templates.ts`.

## Logotipos

Referenciados como `{{ .SiteURL }}/images/dashboard/logo-fgb.png` e `logo-branco.png`.
Certifique-se de que esses arquivos estão publicados no domínio de produção.
