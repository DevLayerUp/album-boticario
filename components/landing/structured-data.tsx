import type { FaqItem } from "@/components/landing/faq-section";
import type { FooterSocialLink } from "@/components/landing/footer-section";

interface LandingStructuredDataProps {
  siteUrl: string;
  siteName: string;
  description: string;
  logoUrl: string;
  faqItems: FaqItem[];
  socialLinks: FooterSocialLink[];
}

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify gera conteúdo controlado (sem input do usuário não escapado).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Dados estruturados (schema.org) da landing pública.
 * - WebSite: identidade do site para o Google.
 * - Organization: marca + redes sociais (sameAs) → knowledge panel.
 * - FAQPage: elegível a rich result a partir das perguntas frequentes.
 */
export function LandingStructuredData({
  siteUrl,
  siteName,
  description,
  logoUrl,
  faqItems,
  socialLinks,
}: LandingStructuredDataProps) {
  const absoluteLogo = logoUrl.startsWith("http")
    ? logoUrl
    : `${siteUrl}${logoUrl.startsWith("/") ? "" : "/"}${logoUrl}`;

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: `${siteUrl}/`,
    inLanguage: "pt-BR",
    description,
  };

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Fundação Grupo Boticário",
    alternateName: "Fãs por Natureza",
    url: `${siteUrl}/`,
    logo: absoluteLogo,
    sameAs: socialLinks.map((s) => s.href).filter(Boolean),
  };

  const faqPage = faqItems.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }
    : null;

  return (
    <>
      <JsonLd data={website} />
      <JsonLd data={organization} />
      {faqPage && <JsonLd data={faqPage} />}
    </>
  );
}
