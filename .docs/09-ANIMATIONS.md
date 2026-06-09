# 🎬 Animações — Framer Motion

## Stack de Animação

- **Framer Motion** — animações de UI, transições, gestos
- **CSS 3D Transforms** — flip de páginas e figurinhas
- **Canvas Confetti** — explosão de confetes para super rara

```bash
npm install framer-motion canvas-confetti
npm install --save-dev @types/canvas-confetti
```

---

## 1. Revelação da Figurinha do Usuário (Onboarding)

```typescript
// components/onboarding/RevealStep.tsx
// Efeito: zoom in + fade + brilho

const revealVariants = {
  hidden: { scale: 0.3, opacity: 0, rotateY: 180 },
  visible: {
    scale: 1,
    opacity: 1,
    rotateY: 0,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 15,
      duration: 0.8
    }
  }
}

const glowVariants = {
  hidden: { boxShadow: '0 0 0px rgba(255,215,0,0)' },
  visible: {
    boxShadow: ['0 0 20px rgba(255,215,0,0.8)', '0 0 60px rgba(255,215,0,0.4)', '0 0 20px rgba(255,215,0,0.8)'],
    transition: { duration: 1.5, repeat: Infinity, repeatType: 'reverse' }
  }
}

<motion.div
  style={{ perspective: '1000px' }}
  initial="hidden"
  animate="visible"
  variants={revealVariants}
>
  <motion.div variants={glowVariants}>
    <img src={stickerUrl} alt="Minha figurinha" />
  </motion.div>
</motion.div>
```

---

## 2. Flipbook (Virar Página do Álbum)

```typescript
// components/album/FlipPage.tsx
// Rotação 3D no eixo Y, efeito de dobrar página

const flipVariants = {
  rightPage: {
    rotateY: 0,
    transformOrigin: 'left center',
    zIndex: 1
  },
  flipping: {
    rotateY: -180,
    transformOrigin: 'left center',
    zIndex: 10,
    transition: { duration: 0.6, ease: [0.4, 0.0, 0.2, 1] }
  }
}

// Wrapper com perspectiva obrigatória
<div style={{ perspective: '1200px', perspectiveOrigin: 'center' }}>
  <motion.div
    variants={flipVariants}
    animate={isFlipping ? 'flipping' : 'rightPage'}
    style={{ transformStyle: 'preserve-3d', position: 'relative' }}
  >
    {/* Frente da página */}
    <div style={{ backfaceVisibility: 'hidden' }}>
      <AlbumPageContent page={currentPage} />
    </div>
    {/* Verso da página (próxima) */}
    <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', position: 'absolute', inset: 0 }}>
      <AlbumPageContent page={nextPage} />
    </div>
  </motion.div>
</div>
```

### Sons (opcional)
```typescript
// Ao virar a página: som de papel
const pageFlipSound = new Audio('/sounds/page-flip.mp3')
pageFlipSound.volume = 0.3
pageFlipSound.play()
```

---

## 3. Abertura do Pacotinho

### Fase 1: Chacoalhar (auto)
```typescript
const shakeVariants = {
  shake: {
    x: [0, -10, 10, -10, 10, -5, 5, 0],
    rotate: [0, -3, 3, -3, 3, -1, 1, 0],
    transition: { duration: 0.8, ease: 'easeInOut' }
  }
}
```

### Fase 2: Rasgar (ao clicar)
```typescript
// Efeito de rasgar: duas metades do pacote se afastam
const topHalfVariants = {
  closed: { y: 0, opacity: 1 },
  torn: {
    y: -200,
    rotate: -15,
    opacity: 0,
    transition: { duration: 0.5, ease: 'easeIn' }
  }
}

const bottomHalfVariants = {
  closed: { y: 0, opacity: 1 },
  torn: {
    y: 200,
    rotate: 5,
    opacity: 0,
    transition: { duration: 0.5, ease: 'easeIn' }
  }
}
```

### Fase 3: Revelar figurinhas (uma por vez)
```typescript
// Cada figurinha: flip de verso para frente
const cardFlipVariants = {
  back: { rotateY: 180, scale: 0.8 },
  front: {
    rotateY: 0,
    scale: 1,
    transition: { duration: 0.5, type: 'spring', stiffness: 100 }
  }
}

// Delay escalonado entre cartas
{stickers.map((sticker, i) => (
  <motion.div
    key={sticker.id}
    initial="back"
    animate={revealedIndex >= i ? 'front' : 'back'}
    variants={cardFlipVariants}
    style={{ transformStyle: 'preserve-3d' }}
  >
    ...
  </motion.div>
))}
```

---

## 4. Efeitos por Raridade

### Comum — sem efeito especial
```typescript
// Apenas o flip normal
```

### Rara — brilho dourado
```typescript
const rareGlowVariants = {
  initial: { boxShadow: '0 0 0px rgba(255,215,0,0)' },
  animate: {
    boxShadow: [
      '0 0 20px rgba(255,215,0,0)',
      '0 0 40px rgba(255,215,0,0.9)',
      '0 0 80px rgba(255,215,0,0.6)',
      '0 0 20px rgba(255,215,0,0.3)'
    ],
    transition: { duration: 1.2, ease: 'easeOut' }
  }
}

// Partículas douradas
const goldParticles = Array.from({ length: 20 }).map((_, i) => ({
  id: i,
  angle: (360 / 20) * i,
  distance: 80 + Math.random() * 40
}))
```

### Super Rara — holográfico + confetes
```typescript
// Efeito holográfico via CSS
// animation: holographic 2s linear infinite

// CSS:
// @keyframes holographic {
//   0%   { background-position: 0% 50%; }
//   50%  { background-position: 100% 50%; }
//   100% { background-position: 0% 50%; }
// }
// background: linear-gradient(135deg, #ff6ec7, #a8edea, #fed6e3, #ffecd2, #a8edea)
// background-size: 400% 400%;

// Confetes ao revelar
import confetti from 'canvas-confetti'

const launchConfetti = () => {
  confetti({
    particleCount: 150,
    spread: 90,
    origin: { y: 0.6 },
    colors: ['#FF6EC7', '#FFD700', '#A8EDEA', '#FFFFFF']
  })
}
```

---

## 5. Colar Figurinha no Álbum

```typescript
// Animação: figurinha "voa" do inventário até o slot
// Implementação: FLIP technique (First, Last, Invert, Play)

// 1. Capturar posição da figurinha no inventário (First)
// 2. Capturar posição do slot no álbum (Last)
// 3. Calcular diferença (Invert)
// 4. Animar de A para B (Play)

const pasteVariants = {
  initial: { scale: 1.2, opacity: 0.8 },
  pasted: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 200, damping: 20 }
  }
}

// Brilho breve ao colar
const stickerPlacedVariants = {
  initial: { filter: 'brightness(1)' },
  animate: {
    filter: ['brightness(1)', 'brightness(2)', 'brightness(1.2)', 'brightness(1)'],
    transition: { duration: 0.5 }
  }
}
```

---

## 6. Quiz: Acerto e Erro

### Acerto
```typescript
const correctVariants = {
  initial: { scale: 1, backgroundColor: '#ffffff' },
  correct: {
    scale: [1, 1.05, 1],
    backgroundColor: '#22c55e',
    transition: { duration: 0.4 }
  }
}

// Ícone de check com spring
const checkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
}
```

### Erro
```typescript
const wrongShake = {
  animate: {
    x: [0, -8, 8, -8, 8, -4, 4, 0],
    backgroundColor: ['#ffffff', '#ef4444', '#fca5a5', '#ffffff'],
    transition: { duration: 0.5 }
  }
}
```

### Ganhar pacotinho (após acerto)
```typescript
// Pacotinho cai do topo da tela com bounce
const packDropVariants = {
  initial: { y: -200, opacity: 0, rotate: -10 },
  animate: {
    y: 0,
    opacity: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
      delay: 0.5
    }
  }
}
```

---

## 7. Transições de Página (App Router)

```typescript
// components/PageTransition.tsx
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit:    { opacity: 0, y: -20, transition: { duration: 0.2 } }
}

// Usar AnimatePresence no layout raiz
<AnimatePresence mode="wait">
  <motion.div
    key={pathname}
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    {children}
  </motion.div>
</AnimatePresence>
```

---

## Checklist de Animações

| Animação | Componente | Status |
|---|---|---|
| Revelação da figurinha do usuário | `RevealStep` | — |
| Virar página do álbum | `FlipPage` | — |
| Abertura do pacotinho (rasgar) | `PackOpener` | — |
| Revelação carta a carta | `PackOpener` | — |
| Brilho dourado (rara) | `StickerCard` | — |
| Holográfico + confetes (super rara) | `StickerCard` | — |
| Colar figurinha no álbum | `StickerSlot` | — |
| Resposta correta no quiz | `QuizOption` | — |
| Resposta errada no quiz | `QuizOption` | — |
| Pacotinho caindo após quiz | `PackDrop` | — |
| Transição entre páginas | `PageTransition` | — |

---

## Performance

- Usar `will-change: transform` com moderação (apenas nas animações ativas)
- Preferir `transform` e `opacity` (compositing layer, não causa reflow)
- `AnimatePresence` com `mode="wait"` para não acumular elementos
- Desativar animações se `prefers-reduced-motion`:

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const variants = prefersReducedMotion
  ? { hidden: {}, visible: {} }  // sem animação
  : revealVariants
```
