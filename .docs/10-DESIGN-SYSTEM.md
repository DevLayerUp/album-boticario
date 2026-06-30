# Design System FGB — Fãs por Natureza

Identidade visual da plataforma, derivada do arquivo Figma **"Design System FGB"**
(`Plataforma troca de figurinhas`, node `18:816`). Esta é a fonte de verdade para
cores, tipografia, raios e componentes. Os valores abaixo já estão refletidos nos
tokens de `app/globals.css` (Tailwind v4 `@theme`).

---

## 1. Cores

### Verde (primária)
| Token | Hex | Uso |
|---|---|---|
| `verde-500` | `#42a52a` | Cor primária — botões, links, ações |
| `verde-400` | `#68b755` | |
| `verde-300` | `#8ec97f` | Texto desabilitado sobre verde |
| `verde-200` | `#b3dbaa` | Eyebrow / texto suave sobre fundo escuro |
| `verde-100` | `#d9edd4` | Fundos suaves, cards de stat, texto sobre verde escuro |

### Verde Escuro (institucional)
| Token | Hex | Uso |
|---|---|---|
| `verde-escuro-500` | `#0d6632` | Fundo do hero, títulos, nav ativo, hover do verde |
| `verde-escuro-400` | `#3d855b` | |
| `verde-escuro-300` | `#6ea384` | |
| `verde-escuro-200` | `#9ec2ad` | |
| `verde-escuro-100` | `#cfe0d6` | |
| `verde-escuro-capa` | `#052e04` | Verde mais escuro (capas/ilustrações) |

### Azul (secundária)
| Token | Hex | Uso |
|---|---|---|
| `azul-500` | `#00aedb` | Ação secundária (botões azuis) |
| `azul-400` | `#33bee2` | |
| `azul-300` | `#66cee9` | |
| `azul-200` | `#99dff1` | |
| `azul-100` | `#cceff8` | |
| `azul-escuro-500` | `#09357a` | Títulos/headers do tema azul |

### Apoio
| Token | Hex | Uso |
|---|---|---|
| `amarelo` (Amarelo Sol) | `#deda00` | CTA de destaque (hero) |
| `verde-genz` | `#99d624` | Bordas de figurinhas (raridade Comum) |
| `gold-500` | `#d2a309` | Botão tema gold (Coleção/Pacotinhos) |
| `gold-700` | `#b57d02` | Título tema gold / borda raridade Super Rara |
| `branco` | `#f9f8f7` | Fundo de página |
| `branco-seringueira` | `#eaffe8` | Fundo verde claríssimo |

### Superfícies dos cards (tema)
| Token | Hex | Tema |
|---|---|---|
| `surface-green` | `#edfee8` | corpo de card verde |
| `surface-blue` | `#f3fbff` | corpo de card azul |
| `surface-gold` | `#ffffe9` | corpo de card gold |

### Aliases semânticos
`--color-primary` → `verde-500`, `--color-primary-hover` → `verde-escuro-500`,
`--color-background` → `branco`, `--color-surface` → `#ffffff`,
`--color-foreground` → `verde-escuro-capa`, `--color-border` → `#e3e3e0`.

---

## 2. Tipografia

Fonte única: **Barlow** (carregada via `next/font/google` em `app/layout.tsx`,
exposta como `--font-display` e `--font-body`). Pesos: 400 / 500 / 700 / 800.

| Estilo | Tamanho | Line-height | Peso | Uso |
|---|---|---|---|---|
| Headline 1 | 60px | 1.2 | Bold (700) | Título de destaque (hero) |
| Headline 2 | 48px | 1.4 | Bold | Seções ("Explorar") |
| Headline 3 | 36px | 1.4 | Bold | |
| Headline 4 / Card title | 32px / 24px | 1.4 | Bold | Títulos de cards |
| Body default | 20px | 28px | Regular (400) | Texto corrido preferencial |
| Body small | 16px | 22px | Regular | Notas / descrições de card |
| Button 1 / 2 / 3 | 24 / 20 / 16px | 1.4 | Medium (500) | Botões |

---

## 3. Raio e elevação

| Token | Valor | Uso |
|---|---|---|
| `--radius-card` | 24px | Cards principais, hero |
| `--radius-block` | 16px | Stat cards, figurinhas |
| `--radius-pill` | 50px | Botões |
| `--radius-input` | 8px | Inputs, botões pequenos |
| `--radius-chip` | 4px | Caixas de ícone |

Sombra de card: `drop-shadow(0 4px 10px rgba(0,0,0,0.15))` (`--shadow-card`).

---

## 4. Componentes

### Botão (pill)
- Forma: `rounded-pill`, `px-10 py-2` (Button 1), texto Medium.
- Variantes de cor: **verde** (`bg-verde-500`, hover `verde-escuro-500`),
  **azul** (`bg-azul-500`, hover `azul-escuro-500`), **amarelo**
  (`bg-amarelo`, texto `verde-escuro-500`), **gold** (`bg-gold-500`),
  **outline** (borda + texto na cor, fundo transparente).
- Estados: Default / Hover / Inativo (fundo `*-100`, texto `*-300`).

### Stat card
- `rounded-block`, `p-4`, altura fixa. Cabeçalho: ícone + label UPPERCASE +
  caixa de ícone `arrow-up-right` com borda. Valor: 48px Bold.
- `variant="solid"` → fundo `verde-escuro-500` + texto `verde-100`.
- `variant="soft"` → fundo `verde-100` + texto `verde-escuro-500`.

### Feature card
- `rounded-card`, sombra de card, `overflow-hidden`.
- **Header** (altura ~228px): slot de imagem de fundo (ver §6) com fallback
  colorido por tema.
- **Body**: fundo por tema (`surface-*`), título 32px Bold, descrição 16px,
  botão pill full-width.
- Prop `theme: "green" | "blue" | "gold"` controla cor de fundo do corpo,
  título e botão.

### Figurinha (sticker card)
- `rounded-block`, borda de 5px na cor da raridade, imagem `object-cover`.
- Raridades: **Comum** borda `verde-genz`/`verde-500`; **Rara** borda
  `azul-500`; **Super Rara** borda `gold-700`.

---

## 5. Navegação

- **Header desktop**: logo à esquerda, nav central, `Perfil` + `Sair` à direita.
- **Nav item**: inativo `verde-500` Medium; ativo `verde-escuro-500` Bold com
  borda inferior 2px.
- **Mobile nav**: barra inferior fixa, ícones `lucide-react`, ativo `verde-500`.

---

## 6. Convenção de imagens de fundo

Várias áreas (hero e headers dos feature cards) usam **imagens de fundo** que
serão importadas manualmente. Para facilitar:

- Coloque os arquivos em **`public/images/dashboard/`**.
- O mapa único de caminhos fica em **`lib/dashboard-assets.ts`**
  (`dashboardAssets.hero`, `dashboardAssets.cards.figurinha`, etc.).
- Os componentes (`HeroBanner`, `FeatureCard`) leem do mapa. Enquanto o arquivo
  não existir, é renderizado um **fallback** (cor sólida do tema), então a UI
  fica completa antes das imagens reais.

Arquivos esperados (nomes sugeridos):

```
public/images/dashboard/
  hero.png              → banner do topo (figurinhas + padrão)
  logo.png              → logotipo "Fãs por Natureza" do header
  cards/
    figurinha.png       → header do card "Minha figurinha"  (tema green)
    album.png           → header do card "Meu Álbum"        (tema blue)
    colecao.png         → header do card "Coleção"          (tema gold)
    pacotinhos.png      → header do card "Pacotinhos"       (tema gold)
    quiz.png            → header do card "Quizz"            (tema green)
    missoes.png         → header do card "Missões"          (tema blue)
    trocas.png          → header do card "Trocas"           (tema green)
```

Para trocar/atualizar, basta substituir o arquivo ou editar o caminho em
`lib/dashboard-assets.ts` — nenhum componente precisa ser tocado.
