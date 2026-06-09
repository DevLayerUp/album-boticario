# Álbum de Figurinhas — Grupo Boticário

Plataforma web gamificada onde usuários criam uma figurinha personalizada,
completam um álbum digital e interagem por meio de pacotinhos, quiz e trocas.

> Estado atual: **Etapa 0 + 1** (fundação, design tokens GB, auth e estrutura).
> Veja o plano completo em [`.docs/00-ROADMAP.md`](./.docs/00-ROADMAP.md).

## Stack

- **Next.js 15** (App Router) + React 19
- **Supabase** (Auth, PostgreSQL, Storage, Edge Functions)
- **Tailwind CSS v4** (configuração CSS-first via `@theme`)
- **Framer Motion** + canvas-confetti (animações — etapas seguintes)

## Design System (base Grupo Boticário)

Sem dependência do Flora. Usamos **tipografia e cores inspiradas na marca GB**,
centralizadas como tokens em [`app/globals.css`](./app/globals.css):

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-gb-green` | `#00A859` | Primária / CTAs |
| `--color-gb-green-dark` | `#006341` | Hover / títulos |
| `--color-gb-cream` | `#F7F3EC` | Fundo |
| `--color-gb-ink` | `#14211B` | Texto |
| `--color-gb-gold` | `#D9A441` | Acento premium |

Tipografia: **Fraunces** (display) + **Mulish** (corpo), via `next/font`.

> Os hex são uma base recomendada. Ao receber o manual de marca oficial,
> ajuste **apenas os tokens** em `globals.css` — o restante do código não muda.

## Começando

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o arquivo de ambiente a partir do exemplo e preencha as chaves:

   ```bash
   cp .env.example .env.local
   ```

   - `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` vêm do
     painel do Supabase (Project Settings → API).

3. Rode o ambiente de desenvolvimento:

   ```bash
   npm run dev
   ```

   Acesse [http://localhost:3000](http://localhost:3000).

## Estrutura

```
/app
  /(auth)        login, register  + callback OAuth
  /(dashboard)   área logada (álbum, coleção, quiz, trocas, perfil)
  /(admin)       painel restrito (role: admin)
  /auth/callback troca de code OAuth por sessão
/components
  /ui            primitivos (Button, Card, Input)
  /auth          formulários e ações de autenticação
  /brand         marca textual
/lib
  /supabase      clients (browser, server, middleware)
  utils.ts       helper cn()
middleware.ts    proteção de rotas (usuário e admin)
```

## Autenticação

- E-mail/senha + OAuth Google (configurar provider no painel Supabase).
- Proteção de rotas via `middleware.ts`:
  - rotas públicas: `/login`, `/register`, `/auth/*`
  - demais rotas exigem sessão
  - `/admin/*` exige `role === "admin"` em `app_metadata`/`user_metadata`.

## Próximas etapas

Consulte os módulos em [`.docs/`](./.docs): banco de dados, geração de
figurinha (remove.bg), admin, álbum, pacotinhos, quiz/missões e trocas.
