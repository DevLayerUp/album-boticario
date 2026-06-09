# 🖼️ Geração de Figurinha — Upload, Remove.bg & Composição

## Fluxo Completo

```
Usuário faz upload da foto
         │
         ▼
Validação client-side (tipo, tamanho, dimensões mínimas)
         │
         ▼
POST /api/sticker/generate
         │
         ▼
Supabase Edge Function: remove-bg
  └── Chama API remove.bg com a imagem
  └── Retorna PNG transparente
         │
         ▼
Composição no servidor (canvas/sharp)
  └── PNG sem fundo + moldura do programa
         │
         ▼
Upload para Supabase Storage (bucket: stickers)
         │
         ▼
Update profiles.sticker_url
         │
         ▼
Animação de revelação da figurinha na tela
```

---

## Supabase Edge Function: remove-bg

### Estrutura do arquivo
`supabase/functions/remove-bg/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const REMOVE_BG_API_KEY = Deno.env.get('REMOVE_BG_API_KEY')!

serve(async (req) => {
  // Verificar autenticação Supabase
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 })
  }

  const formData = await req.formData()
  const imageFile = formData.get('image') as File

  if (!imageFile) {
    return new Response(JSON.stringify({ error: 'No image provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Chamar remove.bg
  const removeBgForm = new FormData()
  removeBgForm.append('image_file', imageFile)
  removeBgForm.append('size', 'auto')

  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: { 'X-Api-Key': REMOVE_BG_API_KEY },
    body: removeBgForm
  })

  if (!response.ok) {
    const error = await response.text()
    return new Response(JSON.stringify({ error }), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Retornar PNG sem fundo como base64
  const buffer = await response.arrayBuffer()
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))

  return new Response(
    JSON.stringify({ image: `data:image/png;base64,${base64}` }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

### Deploy da Edge Function
```bash
supabase functions deploy remove-bg
supabase secrets set REMOVE_BG_API_KEY=your_key_here
```

---

## API Route Next.js: /api/sticker/generate

`app/api/sticker/generate/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const photo = formData.get('photo') as File

  // 1. Validar arquivo
  if (!photo || !['image/jpeg', 'image/png', 'image/webp'].includes(photo.type)) {
    return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
  }
  if (photo.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Imagem muito grande (máx 10MB)' }, { status: 400 })
  }

  // 2. Chamar Edge Function remove-bg
  const edgeFn = await supabase.functions.invoke('remove-bg', {
    body: formData
  })

  if (edgeFn.error) {
    return NextResponse.json({ error: 'Falha ao remover fundo' }, { status: 500 })
  }

  const { image: noBgBase64 } = edgeFn.data
  const noBgBuffer = Buffer.from(noBgBase64.split(',')[1], 'base64')

  // 3. Compor figurinha (foto sem fundo + moldura)
  // A moldura é um PNG com fundo transparente no centro
  // Dimensões padrão da figurinha: 400x550px
  const frameBuffer = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/sticker-frame.png`
  ).then(r => r.arrayBuffer()).then(b => Buffer.from(b))

  const stickerBuffer = await sharp(frameBuffer)
    .composite([
      {
        input: await sharp(noBgBuffer)
          .resize(260, 320, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .toBuffer(),
        top: 110,  // posição Y da foto dentro da moldura
        left: 70   // posição X da foto dentro da moldura
      }
    ])
    .png()
    .toBuffer()

  // 4. Upload para Supabase Storage
  const fileName = `${user.id}/sticker_${Date.now()}.png`
  const { error: uploadError } = await supabase.storage
    .from('stickers')
    .upload(fileName, stickerBuffer, {
      contentType: 'image/png',
      upsert: true
    })

  if (uploadError) {
    return NextResponse.json({ error: 'Falha no upload' }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage
    .from('stickers')
    .getPublicUrl(fileName)

  // 5. Atualizar profile
  await supabase
    .from('profiles')
    .update({ sticker_url: publicUrl, avatar_url: publicUrl })
    .eq('id', user.id)

  return NextResponse.json({ sticker_url: publicUrl })
}
```

### Instalar sharp
```bash
npm install sharp
npm install --save-dev @types/sharp
```

---

## Tela de Onboarding (app/onboarding/page.tsx)

### Estrutura de componentes
```
<OnboardingPage>
  ├── Passo 1: Instrução ("Tire uma selfie ou envie uma foto")
  ├── <PhotoUploader>
  │     ├── Drag & drop zone
  │     ├── Preview da foto selecionada
  │     └── Botão "Usar esta foto"
  ├── Passo 2: Loading com animação ("Criando sua figurinha...")
  │     └── Barra de progresso animada
  └── Passo 3: Revelação
        ├── Animação de flip/reveal da figurinha
        ├── Exibição da figurinha gerada
        └── Botão "Entrar no álbum!"
```

### Lógica do componente
```typescript
'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Step = 'upload' | 'processing' | 'reveal'

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('upload')
  const [stickerUrl, setStickerUrl] = useState<string | null>(null)

  const handleUpload = async (file: File) => {
    setStep('processing')

    const formData = new FormData()
    formData.append('photo', file)

    const res = await fetch('/api/sticker/generate', {
      method: 'POST',
      body: formData
    })

    if (res.ok) {
      const { sticker_url } = await res.json()
      setStickerUrl(sticker_url)
      setStep('reveal')
    } else {
      // tratar erro
      setStep('upload')
    }
  }

  return (
    <AnimatePresence mode="wait">
      {step === 'upload'      && <UploadStep onUpload={handleUpload} />}
      {step === 'processing'  && <ProcessingStep />}
      {step === 'reveal'      && <RevealStep stickerUrl={stickerUrl!} />}
    </AnimatePresence>
  )
}
```

---

## Supabase Storage: Configuração dos Buckets

```sql
-- Via SQL ou Dashboard
insert into storage.buckets (id, name, public)
values ('stickers', 'stickers', true);

insert into storage.buckets (id, name, public)
values ('assets', 'assets', true);    -- moldura, imagens do admin

-- Policy: usuário só faz upload na própria pasta
create policy "stickers_upload_own" on storage.objects
  for insert with check (
    bucket_id = 'stickers' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "stickers_read_all" on storage.objects
  for select using (bucket_id = 'stickers');
```

---

## Assets Necessários

| Arquivo | Descrição | Dimensão |
|---|---|---|
| `sticker-frame.png` | Moldura PNG transparente no centro | 400×550px |
| `sticker-back.png` | Verso da figurinha (para animação de flip) | 400×550px |
| `pack-closed.png` | Pacotinho fechado | 300×420px |
| `pack-open.png` | Pacotinho aberto | 300×420px |

Todos enviados para o bucket `assets` pelo admin.

---

## Fallback: remoção de fundo no browser

Caso prefira não usar remove.bg (custo zero, menor qualidade):
```bash
npm install @imgly/background-removal
```

```typescript
import { removeBackground } from '@imgly/background-removal'

const blob = await removeBackground(file)
// retorna Blob PNG com fundo transparente
// processar diretamente no cliente e enviar para /api/sticker/compose
```

Recomendação: usar remove.bg em produção, fallback browser apenas em dev/teste.
