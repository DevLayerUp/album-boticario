# 🔄 Sistema de Trocas

## Visão Geral

Usuários podem oferecer figurinhas duplicadas em troca de figurinhas que não possuem. O sistema funciona via solicitação: o proponente oferece uma figurinha e solicita uma específica do outro usuário.

---

## Fluxo Completo

```
Usuário A tem: fig_10 (2x), fig_15 (3x)
Usuário B tem: fig_22 (2x), fig_07 (1x)

A quer fig_22, B quer fig_15

1. A acessa "Trocas" → filtra quem tem fig_22
2. A vê B no resultado → clica "Solicitar troca"
3. A escolhe: "Ofereço fig_15 | Quero fig_22"
4. A envia solicitação (com mensagem opcional)
5. B recebe notificação
6. B vê a proposta → aceita ou recusa
   ├── Aceita: fig_15 vai para B, fig_22 vai para A
   │           quantity decrementado em ambos
   └── Recusa: status = 'rejected', nada muda
```

---

## Tela: Trocas (`/trocas`)

### Abas
```
[Minhas Ofertas] [Solicitações Recebidas] [Explorar] [Histórico]
```

### Aba: Explorar (encontrar parceiros de troca)
```
┌─────────────────────────────────────────────┐
│  Explorar Trocas                             │
│                                             │
│  Estou procurando: [Selecionar figurinha ▼] │
│  Tenho para oferecer: [Selecionar ▼]        │
│                                             │
│  Usuários que têm "Malbec" e precisam de... │
│  ┌──────────────────────────────────────┐   │
│  │ 👤 Maria S.   tem: Malbec (2x)       │   │
│  │               quer: Cuide-se Bem     │   │
│  │               [Propor troca]         │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Aba: Solicitações Recebidas
```
┌──────────────────────────────────────────────┐
│  📥 João quer fazer uma troca com você       │
│  Ele oferece: [fig_Malbec 🌟]               │
│  Ele pede:    [fig_CuideSeBem]              │
│  Mensagem: "Pode ser? Tenho 2 Malbec"       │
│                                              │
│  [✅ Aceitar]  [❌ Recusar]                 │
└──────────────────────────────────────────────┘
```

---

## API: Criar Solicitação de Troca

```typescript
// app/api/trades/create/route.ts

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { receiver_id, offered_sticker_id, requested_sticker_id, message } = await request.json()

  // 1. Verificar que o proponente tem a figurinha que está oferecendo (qty >= 2)
  const { data: offeredOwned } = await supabase
    .from('user_stickers')
    .select('quantity')
    .eq('user_id', user!.id)
    .eq('sticker_id', offered_sticker_id)
    .single()

  if (!offeredOwned || offeredOwned.quantity < 2) {
    return NextResponse.json(
      { error: 'Você precisa ter pelo menos 2 cópias para trocar' },
      { status: 400 }
    )
  }

  // 2. Verificar que o receptor tem a figurinha solicitada
  const { data: requestedOwned } = await supabase
    .from('user_stickers')
    .select('quantity')
    .eq('user_id', receiver_id)
    .eq('sticker_id', requested_sticker_id)
    .single()

  if (!requestedOwned || requestedOwned.quantity < 1) {
    return NextResponse.json(
      { error: 'Esse usuário não possui a figurinha solicitada' },
      { status: 400 }
    )
  }

  // 3. Verificar se já existe solicitação pendente igual
  const { data: duplicate } = await supabase
    .from('trade_requests')
    .select('id')
    .eq('requester_id', user!.id)
    .eq('receiver_id', receiver_id)
    .eq('offered_sticker_id', offered_sticker_id)
    .eq('requested_sticker_id', requested_sticker_id)
    .eq('status', 'pending')
    .single()

  if (duplicate) {
    return NextResponse.json({ error: 'Solicitação já enviada' }, { status: 400 })
  }

  // 4. Criar solicitação
  const { data: trade } = await supabase
    .from('trade_requests')
    .insert({
      requester_id: user!.id,
      receiver_id,
      offered_sticker_id,
      requested_sticker_id,
      message
    })
    .select()
    .single()

  // 5. Notificar receptor (via Supabase Realtime ou tabela de notificações)
  await notifyUser(supabase, receiver_id, 'trade_request', trade.id)

  return NextResponse.json({ trade_id: trade.id })
}
```

---

## API: Aceitar Troca

```typescript
// app/api/trades/accept/route.ts

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { trade_id } = await request.json()

  // 1. Buscar a troca
  const { data: trade } = await supabase
    .from('trade_requests')
    .select('*')
    .eq('id', trade_id)
    .eq('receiver_id', user!.id)  // apenas o receptor pode aceitar
    .eq('status', 'pending')
    .single()

  if (!trade) {
    return NextResponse.json({ error: 'Troca não encontrada' }, { status: 404 })
  }

  // 2. Verificar estoque de ambos novamente (pode ter mudado)
  const [{ data: requesterHas }, { data: receiverHas }] = await Promise.all([
    supabase.from('user_stickers')
      .select('quantity').eq('user_id', trade.requester_id)
      .eq('sticker_id', trade.offered_sticker_id).single(),
    supabase.from('user_stickers')
      .select('quantity').eq('user_id', user!.id)
      .eq('sticker_id', trade.requested_sticker_id).single()
  ])

  if (!requesterHas || requesterHas.quantity < 2) {
    await supabase.from('trade_requests')
      .update({ status: 'cancelled' }).eq('id', trade_id)
    return NextResponse.json({ error: 'Proponente não tem mais a figurinha' }, { status: 400 })
  }

  if (!receiverHas || receiverHas.quantity < 1) {
    await supabase.from('trade_requests')
      .update({ status: 'cancelled' }).eq('id', trade_id)
    return NextResponse.json({ error: 'Você não tem mais a figurinha solicitada' }, { status: 400 })
  }

  // 3. Executar a troca (transação)
  // Decrementar offered do requester
  await supabase.from('user_stickers')
    .update({ quantity: requesterHas.quantity - 1 })
    .eq('user_id', trade.requester_id)
    .eq('sticker_id', trade.offered_sticker_id)

  // Decrementar requested do receiver
  await supabase.from('user_stickers')
    .update({ quantity: receiverHas.quantity - 1 })
    .eq('user_id', user!.id)
    .eq('sticker_id', trade.requested_sticker_id)

  // Adicionar offered ao receiver
  await upsertSticker(supabase, user!.id, trade.offered_sticker_id)

  // Adicionar requested ao requester
  await upsertSticker(supabase, trade.requester_id, trade.requested_sticker_id)

  // 4. Marcar troca como aceita
  await supabase.from('trade_requests')
    .update({ status: 'accepted', resolved_at: new Date().toISOString() })
    .eq('id', trade_id)

  // 5. Cancelar outras solicitações pendentes das mesmas figurinhas
  // (para evitar troca de figurinha que não existe mais)
  await supabase.from('trade_requests')
    .update({ status: 'cancelled' })
    .eq('requester_id', trade.requester_id)
    .eq('offered_sticker_id', trade.offered_sticker_id)
    .eq('status', 'pending')
    .neq('id', trade_id)

  // 6. Incrementar progresso da missão de trocas
  await incrementMissionProgress(supabase, user!.id, 'trade_count')
  await incrementMissionProgress(supabase, trade.requester_id, 'trade_count')

  // 7. Notificar proponente
  await notifyUser(supabase, trade.requester_id, 'trade_accepted', trade_id)

  return NextResponse.json({ success: true })
}

// Helper
async function upsertSticker(supabase: SupabaseClient, userId: string, stickerId: number) {
  const { data } = await supabase
    .from('user_stickers')
    .select('id, quantity')
    .eq('user_id', userId)
    .eq('sticker_id', stickerId)
    .single()

  if (data) {
    await supabase.from('user_stickers')
      .update({ quantity: data.quantity + 1 })
      .eq('id', data.id)
  } else {
    await supabase.from('user_stickers')
      .insert({ user_id: userId, sticker_id: stickerId, quantity: 1 })
  }
}
```

---

## Notificações Realtime

Usar Supabase Realtime para notificar o receptor em tempo real:

```typescript
// Em qualquer página do dashboard:
useEffect(() => {
  const channel = supabase
    .channel('trade-notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'trade_requests',
      filter: `receiver_id=eq.${userId}`
    }, (payload) => {
      toast.info('Você recebeu uma solicitação de troca!')
      refetchTrades()
    })
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [userId])
```

---

## Query: Usuários disponíveis para troca

```typescript
// Quem tem a figurinha X que eu quero?
const { data } = await supabase
  .from('user_stickers')
  .select(`
    quantity,
    profiles (id, display_name, sticker_url)
  `)
  .eq('sticker_id', wantedStickerId)
  .gte('quantity', 1)
  .neq('user_id', currentUserId)
```

---

## Regras de Negócio

| Regra | Detalhe |
|---|---|
| Mínimo para oferecer | `quantity >= 2` (guarda 1 para si, oferece o excedente) |
| Mínimo para ser solicitado | `quantity >= 1` do lado do receptor |
| Solicitação duplicada | Bloqueada (mesmo par já tem pendente) |
| Troca aceita cancela outras | Solicitações pendentes com a mesma figurinha são canceladas |
| Ambos progridem na missão | `trade_count` incrementa para os dois participantes |
| Figurinha única não é trocável | `quantity = 1` → não aparece como disponível para troca |
