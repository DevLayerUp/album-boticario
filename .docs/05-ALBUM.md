# 📖 Álbum & Coleção

## Visão Geral

O álbum é o coração da experiência. É um livro digital onde o usuário cola suas figurinhas. As páginas são separadas por categoria e têm animação de virar (flipbook). A coleção é a visão de inventário — todas as figurinhas que o usuário possui.

---

## Estrutura de Dados (recap)

```
sticker_categories  →  album_pages  →  album_slots  →  stickers
                                              ↓
                                        user_album (coladas)
```

---

## Tela: Álbum (`/album`)

### Layout geral
```
┌─────────────────────────────────────────────────────┐
│  [← Anterior]   Categoria: O Boticário   [Próxima →] │
│                  Página 1 de 3                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│   ┌──────┐  ┌──────┐  ┌──────┐                     │
│   │  01  │  │  02  │  │  03  │     ←  slots         │
│   │  ✅  │  │  ✅  │  │  ❓  │                      │
│   └──────┘  └──────┘  └──────┘                     │
│   ┌──────┐  ┌──────┐  ┌──────┐                     │
│   │  04  │  │  05  │  │  06  │                     │
│   │  ✅  │  │  ❓  │  │  ❓  │                      │
│   └──────┘  └──────┘  └──────┘                     │
│                                                      │
│                Progress: 3/6 (50%)                   │
└─────────────────────────────────────────────────────┘

Categorias: [O Boticário] [Natura] [Eudora] [Quem disse Berenice]
```

### Navegação entre categorias
- Tabs ou carrossel horizontal na parte superior
- Cada categoria tem N páginas
- Setas para virar página dentro da categoria

---

## Animação Flipbook (virar página)

Biblioteca recomendada: **`react-pageflip`** ou CSS 3D transform puro com Framer Motion.

### Opção 1: react-pageflip (mais simples)
```bash
npm install react-pageflip
```

```typescript
import HTMLFlipBook from 'react-pageflip'

<HTMLFlipBook
  width={550}
  height={733}
  showCover={true}
  mobileScrollSupport={true}
  onFlip={(e) => setCurrentPage(e.data)}
>
  {pages.map((page) => (
    <div key={page.id} className="page">
      <AlbumPage page={page} userAlbum={userAlbum} />
    </div>
  ))}
</HTMLFlipBook>
```

### Opção 2: Framer Motion (mais controle)
```typescript
// Animação de virar página com rotateY
const flipVariants = {
  front: { rotateY: 0, transition: { duration: 0.6 } },
  back:  { rotateY: -180, transition: { duration: 0.6 } }
}

// Wrapper com perspective para efeito 3D
// style={{ perspective: '1200px' }}
```

---

## Componente: AlbumPage

```typescript
// components/album/AlbumPage.tsx
interface AlbumPageProps {
  page: {
    id: number
    title: string
    background_url: string
    slots: AlbumSlot[]
  }
  userAlbum: UserAlbumEntry[]  // slots já preenchidos pelo usuário
  onStickerClick: (slot: AlbumSlot) => void
}

// Renderiza fundo da página + grid de slots
// Cada slot: <StickerSlot />
```

## Componente: StickerSlot

```typescript
// components/album/StickerSlot.tsx
// Estados:
//   'empty'    → número do slot + silhueta cinza
//   'filled'   → imagem da figurinha + brilho por raridade
//   'owned'    → usuário tem mas ainda não colou → botão "Colar"
//   'duplicate'→ badge indicando que tem mais de 1

// Ao clicar em slot 'owned':
// → Modal de confirmação "Colar esta figurinha?"
// → Animação de colar (ver 09-ANIMATIONS.md)
```

---

## Lógica: Colar Figurinha

```typescript
// app/album/actions.ts (Server Action)
'use server'

export async function pasteSticker(slotId: number, stickerId: number) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Verificar se usuário tem a figurinha
  const { data: owned } = await supabase
    .from('user_stickers')
    .select('quantity')
    .eq('user_id', user!.id)
    .eq('sticker_id', stickerId)
    .single()

  if (!owned || owned.quantity < 1) throw new Error('Figurinha não encontrada')

  // 2. Verificar se slot já está preenchido
  const { data: existing } = await supabase
    .from('user_album')
    .select('id')
    .eq('user_id', user!.id)
    .eq('slot_id', slotId)
    .single()

  if (existing) throw new Error('Slot já preenchido')

  // 3. Colar no álbum
  await supabase.from('user_album').insert({
    user_id: user!.id,
    slot_id: slotId,
    sticker_id: stickerId
  })

  // Nota: não decrementamos quantity pois a figurinha "original" fica no inventário
  // O álbum é uma cópia colada. A duplicata para troca é quantity >= 2.

  return { success: true }
}
```

---

## Query: Carregar Álbum do Usuário

```typescript
// Busca todas as páginas com slots e status do usuário
const { data: albumData } = await supabase
  .from('album_pages')
  .select(`
    id, page_number, title, background_url, category_id,
    album_slots (
      id, slot_number, position_x, position_y,
      stickers (id, name, image_url, rarity_id, rarities(name, color_hex)),
      user_album (id, pasted_at)
    )
  `)
  .eq('category_id', selectedCategoryId)
  .order('page_number')
```

---

## Progresso do Álbum

```typescript
// Calcular % de completude por categoria e total
const getProgress = (pages: AlbumPage[], userAlbum: UserAlbumEntry[]) => {
  const totalSlots = pages.flatMap(p => p.album_slots).length
  const filledSlots = userAlbum.length
  return {
    filled: filledSlots,
    total: totalSlots,
    percentage: Math.round((filledSlots / totalSlots) * 100)
  }
}
```

---

## Tela: Coleção (`/colecao`)

### Layout
```
┌─────────────────────────────────────────────┐
│  Minha Coleção   [Filtrar ▼]  [Buscar...]   │
│                                              │
│  Filtros: [Todas] [Comum] [Rara] [Super Rara]│
│           [O Boticário] [Natura] [Eudora]    │
│                                              │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐        │
│  │ 🌟 │ │    │ │ 2x │ │    │ │    │        │
│  │fig1│ │fig2│ │fig3│ │fig4│ │fig5│        │
│  └────┘ └────┘ └────┘ └────┘ └────┘        │
│                                              │
│  Mostrando 23 de 48 figurinhas              │
└─────────────────────────────────────────────┘
```

### Indicadores visuais
- Badge `2x`, `3x` para figurinhas duplicadas (disponíveis para troca)
- Borda colorida por raridade
- Ícone de estrela/brilho para super rara
- Figurinhas não possuídas: em cinza com cadeado

### Query: coleção do usuário
```typescript
const { data } = await supabase
  .from('user_stickers')
  .select(`
    quantity,
    stickers (
      id, name, image_url, category_id,
      sticker_categories (name),
      rarities (name, color_hex, slug)
    )
  `)
  .eq('user_id', userId)
  .order('sticker_id')
```

---

## Regras de Negócio

| Regra | Detalhe |
|---|---|
| Colar não remove do inventário | `user_stickers.quantity` não é decrementado ao colar |
| Duplicata para troca | `quantity >= 2` = figurinha disponível para oferecer em troca |
| Slot único | Um slot só pode ter uma figurinha colada por usuário |
| Figurinha de usuário | Ocupa um slot especial marcado com `is_user_type = true` |
| Página completa | Quando todos os slots de uma página estão preenchidos → missão progride |
