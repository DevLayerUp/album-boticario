# 🧠 Quiz & Missões

## Quiz Diário

### Regras de negócio
- 1 quiz por dia por usuário (controlado por `user_quiz_answers` + data)
- Ao acertar: ganha N pacotinhos (configurado no quiz)
- Ao errar: sem recompensa, sem nova tentativa no dia
- Se não houver quiz com `valid_date` do dia, sortear quiz ativo sem data

---

## API: Buscar Quiz do Dia

```typescript
// app/api/quiz/daily/route.ts

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = new Date().toISOString().split('T')[0]  // 'YYYY-MM-DD'

  // 1. Verificar se usuário já respondeu hoje
  const { data: answered } = await supabase
    .from('user_quiz_answers')
    .select('id, is_correct, quiz_id')
    .eq('user_id', user!.id)
    .gte('answered_at', `${today}T00:00:00`)
    .lte('answered_at', `${today}T23:59:59`)
    .single()

  if (answered) {
    return NextResponse.json({
      already_answered: true,
      was_correct: answered.is_correct
    })
  }

  // 2. Buscar quiz do dia (por valid_date) ou aleatório
  let quiz = null

  const { data: dated } = await supabase
    .from('quizzes')
    .select('id, question, image_url, points, quiz_options(id, text)')
    .eq('valid_date', today)
    .eq('is_active', true)
    .single()

  if (dated) {
    quiz = dated
  } else {
    // Quiz aleatório ativo, que o usuário ainda não respondeu
    const { data: random } = await supabase
      .from('quizzes')
      .select('id, question, image_url, points, quiz_options(id, text)')
      .eq('is_active', true)
      .is('valid_date', null)
      .not('id', 'in', `(
        select quiz_id from user_quiz_answers where user_id = '${user!.id}'
      )`)
      .limit(1)
      .single()

    quiz = random
  }

  if (!quiz) {
    return NextResponse.json({ no_quiz_available: true })
  }

  // 3. Embaralhar alternativas antes de enviar (não enviar qual é correta!)
  const shuffledOptions = quiz.quiz_options.sort(() => Math.random() - 0.5)

  return NextResponse.json({
    quiz: { ...quiz, quiz_options: shuffledOptions }
    // is_correct NÃO é enviado ao cliente
  })
}
```

---

## API: Responder Quiz

```typescript
// app/api/quiz/answer/route.ts

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { quiz_id, option_id } = await request.json()

  // 1. Verificar se já respondeu este quiz
  const { data: existingAnswer } = await supabase
    .from('user_quiz_answers')
    .select('id')
    .eq('user_id', user!.id)
    .eq('quiz_id', quiz_id)
    .single()

  if (existingAnswer) {
    return NextResponse.json({ error: 'Já respondido' }, { status: 400 })
  }

  // 2. Verificar se a opção é correta
  const { data: option } = await supabase
    .from('quiz_options')
    .select('is_correct, quiz_id, quizzes(points)')
    .eq('id', option_id)
    .single()

  if (!option || option.quiz_id !== quiz_id) {
    return NextResponse.json({ error: 'Opção inválida' }, { status: 400 })
  }

  const isCorrect = option.is_correct

  // 3. Registrar resposta
  await supabase.from('user_quiz_answers').insert({
    user_id: user!.id,
    quiz_id,
    option_id,
    is_correct: isCorrect
  })

  // 4. Se correto, gerar pacotinhos
  if (isCorrect) {
    const points = option.quizzes.points ?? 1
    await fetch('/api/pack/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user!.id,
        source: 'quiz',
        source_ref: String(quiz_id),
        quantity: points
      })
    })
  }

  return NextResponse.json({
    is_correct: isCorrect,
    correct_option_id: option.is_correct ? option_id : null,
    packs_earned: isCorrect ? (option.quizzes.points ?? 1) : 0
  })
}
```

---

## Tela: Quiz (`/quiz`)

### Layout e fluxo
```
Estado 1: Quiz disponível
┌─────────────────────────────────────────┐
│           Quiz do Dia 🧠                │
│                                          │
│  [imagem opcional]                       │
│                                          │
│  "Qual é o produto mais vendido da       │
│   marca O Boticário?"                    │
│                                          │
│  ○  Lança Perfume                        │
│  ○  Malbec                              │
│  ○  Cuide-se Bem                        │
│  ○  Nativa SPA                          │
│                                          │
│  [Responder]  (habilitado após selecionar)│
└─────────────────────────────────────────┘

Estado 2: Acerto (animação → reveal)
┌─────────────────────────────────────────┐
│  ✅ Correto! Você ganhou 1 pacotinho!   │
│  [animação de pacotinho caindo]         │
│  [Abrir agora] ou [Abrir depois]        │
└─────────────────────────────────────────┘

Estado 3: Erro
┌─────────────────────────────────────────┐
│  ❌ Ops! Não foi dessa vez.             │
│  A resposta correta era: Malbec         │
│  Volte amanhã para tentar novamente!   │
└─────────────────────────────────────────┘

Estado 4: Já respondido hoje
┌─────────────────────────────────────────┐
│  Você já respondeu hoje!               │
│  Próximo quiz em: 14h 23min 🕐         │
└─────────────────────────────────────────┘
```

### Countdown para próximo quiz
```typescript
// Calcular tempo até meia-noite
const getTimeUntilMidnight = () => {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  return midnight.getTime() - now.getTime()
}
```

---

## Sistema de Missões

### Tela: Missões (`/quiz` tab ou seção separada)

```
┌──────────────────────────────────────────────┐
│  Missões Ativas                               │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ 📚 Complete uma página do álbum        │  │
│  │ Recompensa: 2 pacotinhos               │  │
│  │ Progresso: ████░░░░  1/1               │  │
│  │ [Reivindicar] ← aparece quando 100%   │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ 🔄 Realize 3 trocas                    │  │
│  │ Recompensa: 1 pacotinho                │  │
│  │ Progresso: ██░░░░░░  1/3               │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ── Concluídas (2) ──                        │
└──────────────────────────────────────────────┘
```

---

## Lógica: Progresso de Missões

O progresso é incrementado por eventos no sistema. Cada tipo de missão é atualizado em seu respectivo módulo:

| Tipo de Missão | Onde incrementar |
|---|---|
| `complete_album_page` | Após `pasteSticker` quando página fica completa |
| `trade_count` | Após troca aceita em `trade_requests` |
| `quiz_streak` | Após resposta correta consecutiva |
| `open_packs` | Após abertura de pack |

```typescript
// lib/missions.ts — função utilitária reutilizável

export async function incrementMissionProgress(
  supabase: SupabaseClient,
  userId: string,
  missionType: string,
  increment: number = 1
) {
  // Buscar missões ativas do tipo
  const { data: missions } = await supabase
    .from('missions')
    .select('id, target_value')
    .eq('type', missionType)
    .eq('is_active', true)
    .or('expires_at.is.null,expires_at.gt.now()')

  for (const mission of missions ?? []) {
    // Upsert progresso
    const { data: userMission } = await supabase
      .from('user_missions')
      .select('id, progress, completed_at')
      .eq('user_id', userId)
      .eq('mission_id', mission.id)
      .single()

    if (userMission?.completed_at) continue  // já completou

    const currentProgress = userMission?.progress ?? 0
    const newProgress = Math.min(currentProgress + increment, mission.target_value)
    const isComplete = newProgress >= mission.target_value

    await supabase.from('user_missions').upsert({
      user_id: userId,
      mission_id: mission.id,
      progress: newProgress,
      completed_at: isComplete ? new Date().toISOString() : null
    }, { onConflict: 'user_id,mission_id' })
  }
}
```

---

## API: Reivindicar Recompensa de Missão

```typescript
// app/api/missions/claim/route.ts

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { mission_id } = await request.json()

  // Verificar que a missão está completa e recompensa não reivindicada
  const { data: userMission } = await supabase
    .from('user_missions')
    .select('id, completed_at, reward_claimed, missions(reward_packs)')
    .eq('user_id', user!.id)
    .eq('mission_id', mission_id)
    .single()

  if (!userMission?.completed_at) {
    return NextResponse.json({ error: 'Missão não concluída' }, { status: 400 })
  }
  if (userMission.reward_claimed) {
    return NextResponse.json({ error: 'Recompensa já reivindicada' }, { status: 400 })
  }

  // Gerar pacotinhos
  const rewardPacks = userMission.missions.reward_packs
  await fetch('/api/pack/create', {
    method: 'POST',
    body: JSON.stringify({
      user_id: user!.id,
      source: 'mission',
      source_ref: String(mission_id),
      quantity: rewardPacks
    })
  })

  // Marcar como reivindicada
  await supabase
    .from('user_missions')
    .update({ reward_claimed: true })
    .eq('id', userMission.id)

  return NextResponse.json({ packs_earned: rewardPacks })
}
```
