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
  /** Páginas de autenticação (login / cadastro). */
  auth: {
    loginBackground: `${BASE}/bg-login.jpg`,
    logoFgb: `${BASE}/logo-fgb.png`,
    logoBranco: `${BASE}/logo-branco.png`,
  },
  /** Elementos decorativos das páginas do álbum (blobs sobre o verde escuro). */
  album: {
    left:  `${BASE}/album/bg-esquerdo.png`,
    right: `${BASE}/album/bg-direito.png`,
    /** Imagem decorativa do fundo geral da página /album (position bottom). */
    page:  `${BASE}/album/bg-page.png`,
  },
  /** Fundo geral da página /pacotinhos (position bottom). */
  pacotinhos: {
    page: `${BASE}/pacotinhos/bg-pacotinhos.png`,
  },
  /** Fundo do card de quiz (linhas topográficas, object-cover). */
  quiz: {
    background: `${BASE}/quiz/blob-lg.png`,
  },
  /** Fundo do card TOP 3 do ranking. */
  ranking: {
    background: `${BASE}/ranking/bg-ranking.png`,
  },
  /** Modal de missão concluída (/missoes). */
  missoes: {
    modalBackground: `${BASE}/missoes/bg-modal-missao.png`,
  },
  /** Card de criação de figurinha personalizada. */
  figurinhaCard: `${BASE}/new-bg-figurinha.png`,
  /** Headers dos feature cards da seção "Explorar". */
  cards: {
    figurinha: `${BASE}/cards/figurinha.png`,
    album: `${BASE}/cards/album.png`,
    colecao: `${BASE}/cards/colecao.png`,
    pacotinhos: `${BASE}/cards/pacotinhos.png`,
    quiz: `${BASE}/cards/quiz.png`,
    missoes: `${BASE}/cards/missoes.png`,
    trocas: `${BASE}/cards/trocas.png`,
    ranking: `${BASE}/cards/ranking.png`,
  },
} as const;

export type DashboardCardKey = keyof typeof dashboardAssets.cards;
