# 🔐 Auth — Autenticação & Onboarding

## Fluxo Completo

```
Acessa o site
     │
     ▼
/login ou /register
     │
     ├── Email/Senha ──────────────────────────────────────────────┐
     │                                                              │
     └── OAuth Google ─────────────────────────────────────────────┤
                                                                    │
                                              Supabase Auth cria auth.users
                                                                    │
                                                      Trigger cria profiles row
                                                                    │
                                              Tem sticker_url? ─────┤
                                                   │       │        │
                                                  Não     Sim       │
                                                   │       │        │
                                              /onboarding  │        │
                                              (upload foto) │        │
                                                   │        │        │
                                                   └────────┘        │
                                                        │            │
                                                   /dashboard ◄──────┘
```

---

## Configuração Supabase

### Providers habilitados
- Email (com confirmação de email)
- Google OAuth

### Configuração Google OAuth (Supabase Dashboard)
```
Authentication > Providers > Google
  Client ID:     <Google Cloud Console>
  Client Secret: <Google Cloud Console>
  Redirect URL:  https://<seu-projeto>.supabase.co/auth/v1/callback
```

### Trigger: criar profile automaticamente
```sql
-- Função executada após cada novo usuário
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
```

---

## Implementação Next.js

### Instalação
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### lib/supabase/client.ts
```typescript
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

### lib/supabase/server.ts
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

### middleware.ts
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { /* igual ao server.ts */ } }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Rotas protegidas: dashboard
  const isDashboard = request.nextUrl.pathname.startsWith('/album') ||
                      request.nextUrl.pathname.startsWith('/colecao') ||
                      request.nextUrl.pathname.startsWith('/quiz') ||
                      request.nextUrl.pathname.startsWith('/perfil') ||
                      request.nextUrl.pathname.startsWith('/trocas')

  // Rotas admin
  const isAdmin = request.nextUrl.pathname.startsWith('/admin')

  if (!user && (isDashboard || isAdmin)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verificar role admin (via user_metadata ou tabela separada)
  if (isAdmin && user?.user_metadata?.role !== 'admin') {
    return NextResponse.redirect(new URL('/album', request.url))
  }

  // Onboarding: redirecionar se não tiver figurinha
  if (user && isDashboard) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('sticker_url')
      .eq('id', user.id)
      .single()

    if (!profile?.sticker_url && !request.nextUrl.pathname.startsWith('/onboarding')) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/album/:path*', '/colecao/:path*', '/quiz/:path*',
            '/perfil/:path*', '/trocas/:path*', '/admin/:path*', '/onboarding']
}
```

---

## Páginas de Auth

### app/(auth)/login/page.tsx — Estrutura
```typescript
// Componentes necessários:
// - <LoginForm /> com campos email + senha
// - Botão "Entrar com Google" → supabase.auth.signInWithOAuth({ provider: 'google' })
// - Link para /register
// - Tratamento de erro: "Email ou senha inválidos"

const handleGoogleLogin = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
}
```

### app/auth/callback/route.ts
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL('/album', request.url))
}
```

---

## Role Admin

Para marcar um usuário como admin, atualizar via Supabase Dashboard ou SQL:
```sql
update auth.users
set raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'
where email = 'admin@boticario.com.br';
```

Verificação no middleware: `user?.user_metadata?.role === 'admin'`

---

## Variáveis de Ambiente

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # apenas server-side
REMOVE_BG_API_KEY=xxxx             # para a Edge Function
```
