# 🎴 Sistema de Pacotinhos

## Visão Geral

Cada pacotinho contém 5 figurinhas sorteadas com base no percentual de raridade configurado pelo admin. A geração das figurinhas ocorre no servidor no momento de criação do pack, não na abertura — garantindo integridade.

---

## Algoritmo de Geração de Pacotinho

### Lógica de sorteio
```typescript
// supabase/functions/generate-pack/index.ts
// OU app/api/pack/generate/route.ts (Server Action)

async function generatePackStickers(supabase: SupabaseClient, userId: string, packId: number) {
  // 1. Buscar raridades com seus percentuais
  const { data: rarities } = await supabase
    .from('rarities')
    .select('id, slug, drop_percentage')

  // 2. Buscar todas as figurinhas ativas por raridade
  const { data: allStickers } = await supabase
    .from('stickers')
    .select('id, rarity_id')
    .eq('is_active', true)
    .eq('is_user_type', false)  // figurinhas de usuário não entram nos packs

  // 3. Gerar 5 figurinhas
  const packStickers = []
  for (let position = 1; position <= 5; position++) {
    const stickerId = drawSticker(rarities, allStickers)
    packStickers.push({ pack_id: packId, sticker_id: stickerId, position })
  }

  // 4. Inserir no banco
  await supabase.from('pack_stickers').insert(packStickers)
}

function drawSticker(rarities: Rarity[], stickers: Sticker[]): number {
  // Sortear raridade com base no %
  const rand = Math.random() * 100
  let accumulated = 0
  let selectedRarityId: number

  for (const rarity of rarities) {
    accumulated += rarity.drop_percentage
    if (rand <= accumulated) {
      selectedRarityId = rarity.id
      break
    }
  }

  // Pegar figurinha aleatória da raridade sorteada
  const pool = stickers.filter(s => s.rarity_id === selectedRarityId)
  if (pool.length === 0) {
    // fallback: pegar da raridade comum
    const fallback = stickers.filter(s => s.slug === 'common')
    return fallback[Math.floor(Math.random() * fallback.length)].id
  }

  return pool[Math.floor(Math.random() * pool.length)].id
}
```

---

## API: Criar Pacotinho

```typescript
// app/api/pack/create/route.ts
// Chamado internamente após quiz correto ou missão completada

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { user_id, source, source_ref, quantity = 1 } = await request.json()

  // Criar N packs
  for (let i = 0; i < quantity; i++) {
    // Inserir pack
    const { data: pack } = await supabase
      .from('packs')
      .insert({ user_id, source, source_ref })
      .select()
      .single()

    // Gerar 5 figurinhas para o pack
    await generatePackStickers(supabase, user_id, pack.id)
  }

  return NextResponse.json({ success: true, packs_created: quantity })
}
```

---

## API: Abrir Pacotinho

```typescript
// app/api/pack/open/route.ts (Server Action ou Route Handler)

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { pack_id } = await request.json()

  // 1. Verificar que o pack pertence ao usuário e está fechado
  const { data: pack } = await supabase
    .from('packs')
    .select('id, opened_at, user_id')
    .eq('id', pack_id)
    .single()

  if (!pack || pack.user_id !== user!.id) {
    return NextResponse.json({ error: 'Pack não encontrado' }, { status: 404 })
  }
  if (pack.opened_at) {
    return NextResponse.json({ error: 'Pack já aberto' }, { status: 400 })
  }

  // 2. Buscar as 5 figurinhas do pack
  const { data: packStickers } = await supabase
    .from('pack_stickers')
    .select('position, stickers(id, name, image_url, rarities(name, slug, color_hex, animation_type))')
    .eq('pack_id', pack_id)
    .order('position')

  // 3. Marcar pack como aberto
  await supabase
    .from('packs')
    .update({ opened_at: new Date().toISOString() })
    .eq('id', pack_id)

  // 4. Adicionar figurinhas ao inventário do usuário
  for (const ps of packStickers) {
    const stickerId = ps.stickers.id
    // Upsert: se já tem, incrementar quantity
    const { data: existing } = await supabase
      .from('user_stickers')
      .select('id, quantity')
      .eq('user_id', user!.id)
      .eq('sticker_id', stickerId)
      .single()

    if (existing) {
      await supabase
        .from('user_stickers')
        .update({ quantity: existing.quantity + 1 })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('user_stickers')
        .insert({ user_id: user!.id, sticker_id: stickerId, quantity: 1 })
    }
  }

  // 5. Retornar figurinhas para animação no cliente
  return NextResponse.json({ stickers: packStickers })
}
```

---

## Tela de Abertura do Pacotinho

### Fluxo de UI
```
1. Usuário clica em "Abrir Pacotinho"
2. Animação do pacote na tela (sacudir, brilhar)
3. Usuário clica/toca para "rasgar" o pacote
4. Animação de abertura (rasgar de cima para baixo)
5. Figurinhas reveladas uma a uma (click to reveal)
6. Cada figurinha: flip de costa para frente
   - Comum:     sem efeito especial
   - Rara:      brilho dourado + partículas
   - Super Rara: holográfico + explosão de confetes
7. Após revelar todas: tela de resumo
8. Botão "Ir para o Álbum" ou "Abrir outro"
```

### Componente PackOpener
```typescript
// components/pack/PackOpener.tsx
type Phase = 'idle' | 'shaking' | 'tearing' | 'revealing' | 'summary'

interface PackOpenerProps {
  packId: number
  onComplete: (stickers: Sticker[]) => void
}

// Estados da máquina:
// idle      → pacote parado na tela
// shaking   → animação de chacoalhar (auto, 1s)
// tearing   → usuário clica para rasgar
// revealing → 5 figurinhas, revelar uma por vez
// summary   → mostrar todas obtidas
```

---

## Tela: Lista de Pacotinhos (`/pacotinhos` ou modal no dashboard)

```
┌──────────────────────────────────────────┐
│  Meus Pacotinhos (3 disponíveis)         │
│                                          │
│  ┌──────┐  ┌──────┐  ┌──────┐           │
│  │ 📦   │  │ 📦   │  │ 📦   │           │
│  │ #001 │  │ #002 │  │ #003 │           │
│  │ quiz │  │ missão│ │ quiz │           │
│  [Abrir] [Abrir]  [Abrir]               │
│                                          │
│  ─────── Já abertos (12) ───────         │
│  (histórico colapsável)                  │
└──────────────────────────────────────────┘
```

---

## Query: Pacotinhos disponíveis do usuário

```typescript
const { data: availablePacks } = await supabase
  .from('packs')
  .select('id, source, source_ref, created_at')
  .eq('user_id', userId)
  .is('opened_at', null)
  .order('created_at')
```

---

## Regras de Negócio

| Regra | Detalhe |
|---|---|
| Figurinhas geradas na criação | `pack_stickers` populado no `create`, não no `open` |
| Pack imutável | Após criado, as figurinhas não mudam |
| Sem reabrir | `opened_at` não nulo = pack consumido |
| Duplicatas permitidas | Mesmo pacote pode ter 2x a mesma figurinha |
| Figurinha de usuário | Nunca entra no sorteio de packs (is_user_type) |
| Inventário incrementa | `user_stickers.quantity++` a cada figurinha recebida |
