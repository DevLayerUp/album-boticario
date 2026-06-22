# Templates de e-mail (Supabase Auth)

Templates HTML alinhados ao design system do projeto (verde `#0d6632`, amarelo `#deda00`, fundo `#f9f8f7`, Barlow).

## Arquivos

| Arquivo | Uso no Supabase |
|---|---|
| `confirm-signup.html` | **Authentication → Email Templates → Confirm signup** |
| `reset-password.html` | **Authentication → Email Templates → Reset password** |

## Como aplicar

1. Abra o [Dashboard Supabase](https://supabase.com/dashboard) → **Authentication** → **Email Templates**.
2. Selecione o template desejado.
3. Cole o conteúdo HTML do arquivo correspondente no campo **Message body**.
4. Defina o **Subject** sugerido abaixo.
5. Salve.

### Assuntos recomendados

- **Confirm signup:** `Confirme sua conta — Fãs da Natureza`
- **Reset password:** `Redefinir sua senha — Fãs da Natureza`

## Variáveis Supabase

Os templates usam a sintaxe Go do Supabase:

| Variável | Descrição |
|---|---|
| `{{ .ConfirmationURL }}` | Link de confirmação ou redefinição de senha |
| `{{ .SiteURL }}` | URL base do site (para carregar os logotipos) |

Não remova `{{ .ConfirmationURL }}` — é obrigatório para o fluxo de auth funcionar.

## Logotipos

As imagens são servidas pelo app em `public/images/dashboard/`:

- `logo-fgb.png` — Fundação Grupo Boticário
- `logo-branco.png` — Fãs da Natureza (header verde)

Elas são referenciadas como `{{ .SiteURL }}/images/dashboard/...`. Por isso:

1. **Authentication → URL Configuration → Site URL** deve apontar para o domínio público (ex.: `https://album.exemplo.com`), não apenas `localhost`, em produção.
2. Os arquivos de logo precisam estar publicados nesse domínio.

## Pré-requisitos no projeto

- **Site URL** e **Redirect URLs** configurados (ver `supabase/README.md` → Recuperação de senha).
- Fluxo de cadastro com confirmação de e-mail habilitado em **Providers → Email**.
