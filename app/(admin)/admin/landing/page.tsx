import { createClient } from "@/lib/supabase/server";
import { LandingAdminClient } from "./landing-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Landing Page — Admin",
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const DEFAULT_WELCOME = {
  title: "Seja bem-vindo Fã por natureza!",
  paragraph1:
    "Se você ama descobrir curiosidades, completar coleções e explorar o mundo ao seu redor, este álbum foi feito para você.",
  paragraph2:
    "Ao longo das páginas, você vai conhecer espécies fascinantes, biomas brasileiros, projetos de conservação e histórias que ajudam a proteger a natureza há mais de 35 anos.",
  ctaLabel: "Comece a colecionar agora!",
  ctaHref:  "/register",
  videoUrl:  null as string | null,
  posterUrl: null as string | null,
};

const DEFAULT_FAQ = {
  eyebrow: "PERGUNTAS FREQUENTES",
  title:   "Perguntas frequentes",
  items: [
    {
      question: "O álbum é gratuito?",
      answer:   "Sim. Basta realizar seu cadastro para começar a colecionar.",
    },
    {
      question: "Como consigo novas figurinhas?",
      answer:
        "Ao participar da campanha, você recebe pacotinhos virtuais para abrir e descobrir novas figurinhas no álbum.",
    },
    {
      question: "Posso trocar figurinhas repetidas?",
      answer:
        "Sim! A plataforma permite trocar figurinhas repetidas com outros colecionadores da comunidade.",
    },
    {
      question: "Preciso completar o álbum sozinho?",
      answer:
        "Não. Você pode trocar figurinhas com a comunidade para completar sua coleção mais rápido.",
    },
    {
      question: "O que é o movimento Fãs por Natureza?",
      answer:
        "É uma comunidade de pessoas apaixonadas pela natureza brasileira, reunidas para aprender, compartilhar e defender a biodiversidade.",
    },
  ],
};

const DEFAULT_FOOTER = {
  logoUrl:        null as string | null,
  logoHref:       "https://fundacaogrupoboticario.org.br/",
  waveTopUrl:     null as string | null,
  patternUrl:     null as string | null,
  backToTopLabel: "Voltar ao topo",
  socialLinks: [
    { platform: "youtube" as const,   label: "YouTube",   href: "https://www.youtube.com/user/fundacaoboticario" },
    { platform: "linkedin" as const,  label: "LinkedIn",  href: "https://www.linkedin.com/company/fundacaogrupoboticario/" },
    { platform: "instagram" as const, label: "Instagram", href: "https://www.instagram.com/fundacaogrupoboticario/" },
    { platform: "facebook" as const,  label: "Facebook",  href: "https://www.facebook.com/fundacaogrupoboticario" },
    { platform: "tiktok" as const,    label: "TikTok",    href: "https://www.tiktok.com/@fundacaogrupoboticario" },
  ],
  navColumns: [
    {
      items: [
        {
          kind:  "group" as const,
          title: "Quem somos",
          links: [
            { label: "Quem somos", href: "https://fundacaogrupoboticario.org.br/quem-somos/" },
            { label: "35 anos de proteção da natureza", href: "https://fundacaogrupoboticario.org.br/35-anos/" },
            { label: "35 anos em 35 histórias", href: "https://fundacaogrupoboticario.org.br/35x35/" },
          ],
        },
        {
          kind:  "group" as const,
          title: "Nossa atuação",
          links: [
            { label: "Nosso portfólio", href: "https://fundacaogrupoboticario.org.br/nossa-atuacao/" },
            { label: "Clima e adaptação", href: "https://fundacaogrupoboticario.org.br/nossa-atuacao/", showChevron: true },
            { label: "Oceano e costa resiliente", href: "https://fundacaogrupoboticario.org.br/nossa-atuacao/oceano-e-resiliencia-costeira/" },
            { label: "Água doce e qualidade da água", href: "https://fundacaogrupoboticario.org.br/nossa-atuacao/agua-e-seguranca-hidrica/" },
            { label: "Nossas reservas", href: "https://fundacaogrupoboticario.org.br/nossa-atuacao/nossas-reservas/" },
            { label: "Áreas naturais protegidas e restauradas", href: "https://fundacaogrupoboticario.org.br/nossa-atuacao/areas-naturais/" },
            { label: "Soluções e impacto para a natureza", href: "https://fundacaogrupoboticario.org.br/nossa-atuacao/solucoes-e-impacto/" },
          ],
        },
      ],
    },
    {
      items: [
        {
          kind:  "group" as const,
          title: "Educação ambiental e engajamento",
          links: [
            { label: "Recursos educativos e projetos para você", href: "https://fundacaogrupoboticario.org.br/para-voce/" },
            { label: "Meu Ambiente", href: "https://fundacaogrupoboticario.org.br/para-voce/colecao-meu-ambiente/" },
            { label: "Colecionando Natureza", href: "/" },
            { label: "Plataforma de Defensores do Cerrado", href: "https://fundacaogrupoboticario.org.br/defensores-do-cerrado/" },
            { label: "Notícias, fatos e histórias", href: "https://fundacaogrupoboticario.org.br/noticias/" },
          ],
        },
        { kind: "link" as const, label: "Biblioteca", href: "https://fundacaogrupoboticario.org.br/para-voce/biblioteca/" },
        { kind: "link" as const, label: "Contato", href: "https://fundacaogrupoboticario.org.br/fale-conosco/" },
        { kind: "link" as const, label: "Sala de imprensa", href: "https://fundacaogrupoboticario.org.br/sala-de-imprensa/" },
        {
          kind:      "group" as const,
          title:     "Transparência",
          titleHref: "https://fundacaogrupoboticario.org.br/transparencia/",
          links: [
            { label: "Relatórios e publicações", href: "https://fundacaogrupoboticario.org.br/transparencia/publicacoes/" },
          ],
        },
        { kind: "link" as const, label: "Canal de conduta", href: "https://conduta.grupoboticario.com.br/" },
      ],
    },
  ],
};

const DEFAULT_FANDOM = {
  gifUrl:              null as string | null,
  card2Url:            null as string | null,
  heading:             "Vista a camisa e VIBRE pela nossa natureza",
  paragraph1:          "Ser fã é acompanhar, vibrar, defender e entrar em campo por aquilo em que você acredita. E quando o assunto é a natureza brasileira, toda torcida faz diferença.",
  paragraph2:          "O Somos Fãs por Natureza é uma comunidade feita para quem acredita que proteger a natureza merece a mesma paixão de quem torce pelo seu time, acompanhar seu ídolo ou celebra cada conquista.",
  paragraph2Highlight: "Somos Fãs por Natureza",
  paragraph3:          "Aqui, cada pessoa pode fazer parte dessa torcida: aprendendo, compartilhando conhecimento e descobrindo histórias inspiradoras sobre a biodiversidade brasileira.",
  ctaLabel:            "Faça parte do Fandom",
  ctaHref:             "/register",
  socialLinks: [
    { iconUrl: null as string | null, label: "Instagram", href: "#" },
    { iconUrl: null as string | null, label: "TikTok",    href: "#" },
    { iconUrl: null as string | null, label: "LinkedIn",  href: "#" },
    { iconUrl: null as string | null, label: "YouTube",   href: "#" },
  ],
};

const DEFAULT_REGISTER = {
  backgroundUrl: null as string | null,
  heading:    "Comece sua coleção agora",
  paragraph1: "Cadastre-se para acessar o álbum digital Colecionando Natureza, abrir seus primeiros pacotinhos e começar uma jornada cheia de espécies incríveis, curiosidades e desafios.",
  paragraph2: "Preencha seus dados para receber acesso ao álbum digital e fazer parte da comunidade de Fãs por Natureza.",
  formTitle:  "Preencha o formulário e comece a colecionar",
  ctaLabel:   "Comece a colecionar agora!",
  privacyUrl: "/privacidade",
};

const DEFAULT_MANIFEST = {
  titleRegular: "O mundo tem sede",
  titleBold:    "de mudança",
  videoUrl:     null as string | null,
  posterUrl:    null as string | null,
};

const DEFAULT_JOURNEY = {
  titleRegular: "Uma jornada pela",
  titleBold:    "nossa biodiversidade",
  paragraph1:
    "Se você ama descobrir curiosidades, completar coleções e explorar o mundo ao seu redor, este álbum foi feito para você.",
  paragraph2:
    "Ao longo das páginas, você vai conhecer espécies fascinantes, biomas brasileiros, projetos de conservação e histórias que ajudam a proteger a natureza há mais de 35 anos.",
  ctaLabel: "Comece a colecionar agora!",
  ctaHref:  "/register",
  imageUrl: null as string | null,
};

const DEFAULT_HOW_IT_WORKS = {
  title: "Como funciona?",
  steps: [
    {
      iconUrl: null as string | null,
      title: "Faça seu cadastro",
      description:
        "Crie sua conta gratuitamente e receba acesso ao álbum digital dos Fãs por Natureza.",
    },
    {
      iconUrl: null as string | null,
      title: "Abra seus pacotinhos",
      description:
        "Ganhe novos pacotes de figurinhas para descobrir espécies, biomas e curiosidades sobre a natureza brasileira.",
    },
    {
      iconUrl: null as string | null,
      title: "Cole as figurinhas",
      description: "Explore o álbum e cole as figurinhas",
    },
  ],
};

export default async function LandingAdminPage() {
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("app_settings")
    .select("key, value")
    .in("key", ["landing_navbar", "landing_hero", "landing_welcome", "landing_manifest", "landing_journey", "landing_how_it_works", "landing_register", "landing_fandom", "landing_faq", "landing_footer"]);

  const map = Object.fromEntries(
    (rows ?? []).map((r: { key: string; value: string | null }) => [r.key, r.value]),
  );

  const navbar = safeParse(map["landing_navbar"], {
    logoUrl: null,
    links: [
      { label: "Conheça o Álbum da Natureza", href: "#album" },
      { label: "Projeto Fãs por Natureza",    href: "#projeto" },
      { label: "FAQ",                          href: "#faq" },
    ],
    ctaLabel: "Quero participar!",
    ctaHref:  "/register",
  });

  const hero = safeParse(map["landing_hero"], {
    logoUrl:       null,
    backgroundUrl: null,
    headingWhite:  "Colecione a natureza.",
    headingYellow: "Descubra o Brasil.",
    subtitle:
      "O álbum oficial dos Fãs por Natureza chegou! Complete sua coleção, conheça espécies incríveis, descubra curiosidades sobre os biomas brasileiros e explore a história da Fundação Grupo Boticário.",
    ctaLabel: "Quero meu álbum",
    ctaHref:  "/register",
  });

  const welcome    = safeParse(map["landing_welcome"],       DEFAULT_WELCOME);
  const manifest   = safeParse(map["landing_manifest"],      DEFAULT_MANIFEST);
  const journey    = safeParse(map["landing_journey"],       DEFAULT_JOURNEY);
  const howItWorks = safeParse(map["landing_how_it_works"],  DEFAULT_HOW_IT_WORKS);
  const register   = safeParse(map["landing_register"],      DEFAULT_REGISTER);
  const fandom     = safeParse(map["landing_fandom"],        DEFAULT_FANDOM);
  const faq        = safeParse(map["landing_faq"],           DEFAULT_FAQ);
  const footer     = safeParse(map["landing_footer"],      DEFAULT_FOOTER);

  return (
    <LandingAdminClient
      initialNavbar={navbar}
      initialHero={hero}
      initialWelcome={welcome}
      initialManifest={manifest}
      initialJourney={journey}
      initialHowItWorks={howItWorks}
      initialRegister={register}
      initialFandom={fandom}
      initialFaq={faq}
      initialFooter={footer}
    />
  );
}
