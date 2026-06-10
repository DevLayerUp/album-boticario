/**
 * Mapa único de imagens de fundo da dashboard (Design System FGB).
 *
 * As imagens são importadas manualmente em `public/images/dashboard/`.
 * Enquanto o arquivo não existir, os componentes (`HeroBanner`, `FeatureCard`)
 * renderizam um fallback colorido por tema — a UI fica completa sem as imagens.
 *
 * Para trocar uma imagem: substitua o arquivo ou edite o caminho aqui.
 * Nenhum componente precisa ser alterado.
 *
 * Ver: .docs/10-DESIGN-SYSTEM.md (§6 Convenção de imagens de fundo).
 */

const BASE = "/images/dashboard";

export const dashboardAssets = {
  /** Banner do topo da dashboard. */
  hero: `${BASE}/hero.png`,
  /** Logotipo "Fãs da Natureza" usado no header. */
  logo: `${BASE}/logo.png`,
  /** Elementos decorativos das páginas do álbum (blobs sobre o verde escuro). */
  album: {
    left:  `${BASE}/album/bg-esquerdo.png`,
    right: `${BASE}/album/bg-direito.png`,
    /** Imagem decorativa do fundo geral da página /album (position bottom). */
    page:  `${BASE}/album/bg-page.png`,
  },
  /** Headers dos feature cards da seção "Explorar". */
  cards: {
    figurinha: `${BASE}/cards/figurinha.png`,
    album: `${BASE}/cards/album.png`,
    colecao: `${BASE}/cards/colecao.png`,
    pacotinhos: `${BASE}/cards/pacotinhos.png`,
    quiz: `${BASE}/cards/quiz.png`,
    missoes: `${BASE}/cards/missoes.png`,
    trocas: `${BASE}/cards/trocas.png`,
  },
} as const;

export type DashboardCardKey = keyof typeof dashboardAssets.cards;
