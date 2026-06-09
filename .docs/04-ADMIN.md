# ⚙️ Admin Dashboard

## Visão Geral

Painel interno acessível apenas por usuários com `role: admin`. Permite gerenciar todo o conteúdo do programa sem precisar de código.

**Rota base:** `/admin`
**Proteção:** middleware verifica `user_metadata.role === 'admin'`

---

## Estrutura de Rotas Admin

```
/admin                    ← Overview / dashboard
/admin/figurinhas         ← Lista de figurinhas
/admin/figurinhas/nova    ← Criar figurinha
/admin/figurinhas/[id]    ← Editar figurinha
/admin/categorias         ← CRUD de categorias
/admin/raridades          ← Configurar raridades e % de tiragem
/admin/album              ← Montar páginas do álbum (slots)
/admin/quiz               ← Lista de perguntas
/admin/quiz/novo          ← Criar pergunta
/admin/quiz/[id]          ← Editar pergunta
/admin/missoes            ← CRUD de missões
/admin/usuarios           ← Listagem de usuários
```

---

## Layout Admin

### app/(admin)/admin/layout.tsx
```typescript
// Sidebar com navegação
// Links: Visão Geral, Figurinhas, Categorias, Raridades, Álbum, Quiz, Missões, Usuários
// Header com nome do admin logado + botão sair
// Proteção via middleware (já resolvido)
```

---

## Módulo: Figurinhas

### Campos do formulário (nova/editar)
| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| Nome | text | ✅ | Nome exibido na figurinha |
| Descrição | textarea | ❌ | Texto do verso/tooltip |
| Imagem | file upload | ✅ | PNG/JPG → upload para bucket `assets` |
| Categoria | select | ✅ | Populado de `sticker_categories` |
| Raridade | select | ✅ | Populado de `rarities` |
| Tipo usuário | checkbox | ❌ | Marca `is_user_type = true` |
| Ativo | toggle | ✅ | Default: ativo |

### Listagem com filtros
- Filtros: por categoria, por raridade, por status (ativo/inativo)
- Colunas: thumbnail, nome, categoria, raridade, qtd no álbum, ações
- Ações: editar, desativar, excluir (com confirmação)

### Upload de imagem (componente reutilizável)
```typescript
// components/admin/ImageUploader.tsx
// - Drag & drop
// - Preview antes de salvar
// - Faz upload para Supabase Storage /assets/stickers/
// - Retorna URL pública
// - Validação: max 5MB, PNG/JPG/WEBP
```

---

## Módulo: Categorias

### Campos
| Campo | Tipo |
|---|---|
| Nome | text |
| Descrição | textarea |
| Imagem de capa | file upload |
| Ordem (sort_order) | number |

### Regra de negócio
- Não pode excluir categoria que tenha figurinhas vinculadas
- Reordenação por drag-and-drop (sort_order)

---

## Módulo: Raridades & % de Tiragem

### Tela de configuração
```
┌─────────────────────────────────────────┐
│  Configurar Distribuição de Pacotinhos  │
├──────────────┬────────────┬─────────────┤
│  Raridade    │     %      │  Cor badge  │
├──────────────┼────────────┼─────────────┤
│  Comum       │  [70.00]%  │  [#A8A8A8]  │
│  Rara        │  [25.00]%  │  [#FFD700]  │
│  Super Rara  │  [ 5.00]%  │  [#FF6EC7]  │
├──────────────┴────────────┴─────────────┤
│  Total: 100.00%  ✅  [Salvar]           │
└─────────────────────────────────────────┘
```

### Validação
- A soma dos percentuais deve ser exatamente 100%
- Bloqueio de salvar se total ≠ 100%
- Aviso em tempo real da diferença

---

## Módulo: Álbum (montar páginas)

### Funcionalidade
O admin define quais figurinhas aparecem em cada página e onde.

```
/admin/album

Selecionar categoria → ver páginas da categoria
  └── Cada página: grade com slots
        ├── Slot ocupado: mostra thumbnail da figurinha
        ├── Slot vazio: botão "+" para adicionar figurinha
        └── Arrastar figurinha para reposicionar
```

### Lógica
- Uma página pode ter N slots (recomendado: 9 ou 12 por página)
- Cada slot referencia uma figurinha da categoria
- `position_x` e `position_y` guardam % de posição para layout responsivo
- Admin pode criar múltiplas páginas por categoria

### Formulário de página
| Campo | Tipo |
|---|---|
| Categoria | select |
| Número da página | number (auto) |
| Título da página | text |
| Imagem de fundo | file upload |

---

## Módulo: Quiz

### Campos da pergunta
| Campo | Tipo | Obs |
|---|---|---|
| Pergunta | textarea | ✅ |
| Imagem | file upload | ❌ opcional |
| Data válida | datepicker | ❌ null = qualquer dia |
| Pacotinhos ao acertar | number | default 1 |
| Ativo | toggle | ✅ |

### Alternativas (dentro do formulário)
- Mínimo 2, máximo 4 alternativas
- Exatamente 1 marcada como correta
- Botão "+ Adicionar alternativa"

### Exemplo visual
```
Pergunta: "Qual marca pertence ao Grupo Boticário?"
○  L'Oreal
●  Eudora       ← correta
○  Avon
○  Mary Kay

[+ Adicionar alternativa]
[Salvar]
```

### Regras de negócio
- Não pode ter 0 alternativas corretas
- Não pode ter 2+ alternativas corretas
- Quiz com `valid_date` no passado é ocultado automaticamente do usuário

---

## Módulo: Missões

### Campos
| Campo | Tipo | Obs |
|---|---|---|
| Título | text | ✅ |
| Descrição | textarea | ✅ |
| Tipo | select | ver tipos abaixo |
| Meta (target_value) | number | ex: 3 (fazer 3 trocas) |
| Pacotinhos de recompensa | number | ✅ |
| Imagem | file upload | ❌ |
| Expira em | datetime | ❌ |
| Ativo | toggle | ✅ |

### Tipos de missão disponíveis
| Slug | Descrição | target_value |
|---|---|---|
| `complete_album_page` | Completar X páginas do álbum | nº de páginas |
| `trade_count` | Realizar X trocas | nº de trocas |
| `quiz_streak` | Acertar X quizzes seguidos | nº de acertos |
| `open_packs` | Abrir X pacotinhos | nº de packs |
| `custom` | Manual (verificação pelo admin) | — |

---

## Módulo: Usuários

### Listagem
- Colunas: avatar, nome, email, figurinha, packs abertos, % álbum, data cadastro
- Filtros: data de cadastro, tem figurinha (sim/não)
- Busca por nome/email

### Ações por usuário
- Ver perfil completo (coleção, álbum, histórico)
- Conceder pacotinhos manualmente
- Suspender conta

### Ação de conceder pacotinho
```typescript
// POST /api/admin/grant-pack
// Body: { user_id, quantity, reason }
// Cria N rows em packs com source = 'admin_grant'
```

---

## Proteção das Rotas Admin (API)

Todas as rotas `/api/admin/*` devem verificar role no servidor:

```typescript
// lib/admin-guard.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function adminGuard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return null // sem erro
}

// Uso em qualquer route handler:
// const guard = await adminGuard()
// if (guard) return guard
```
