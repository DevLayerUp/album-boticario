import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingHero } from "@/components/landing/hero";
import { LandingWelcome } from "@/components/landing/welcome-section";
import { LandingManifest } from "@/components/landing/manifest-section";
import { LandingJourney } from "@/components/landing/journey-section";
import { LandingHowItWorks } from "@/components/landing/how-it-works-section";
import { LandingRegister } from "@/components/landing/register-section";
import { LandingFandom } from "@/components/landing/fandom-section";
import { LandingFaq } from "@/components/landing/faq-section";
import { LandingFooter } from "@/components/landing/footer-section";
import { LandingCookieConsent } from "@/components/landing/cookie-consent";
import { LandingStructuredData } from "@/components/landing/structured-data";
import { DEFAULT_FAQ_ITEMS } from "@/components/landing/faq-section";
import { DEFAULT_SOCIAL_LINKS } from "@/components/landing/footer-section";
import type { Metadata } from "next";
import { GBG_PRIVACY_URL } from "@/lib/landing-urls";
import { buildRouteMetadata, fetchSeoSettings, getSiteUrl } from "@/lib/seo-metadata";
import type { LandingNavbarProps } from "@/components/landing/navbar";
import type { LandingHeroProps } from "@/components/landing/hero";
import type { LandingWelcomeProps } from "@/components/landing/welcome-section";
import type { LandingManifestProps } from "@/components/landing/manifest-section";
import type { LandingJourneyProps } from "@/components/landing/journey-section";
import type { LandingHowItWorksProps } from "@/components/landing/how-it-works-section";
import type { LandingRegisterProps } from "@/components/landing/register-section";
import type { LandingFandomProps } from "@/components/landing/fandom-section";
import type { LandingFaqProps } from "@/components/landing/faq-section";
import type { LandingFooterProps } from "@/components/landing/footer-section";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSeoSettings();
  return buildRouteMetadata(settings, "home", "/");
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  // Fetch landing settings (public read — RLS allows)
  const { data: rows } = await supabase
    .from("app_settings")
    .select("key, value")
    .in("key", ["landing_navbar", "landing_hero", "landing_welcome", "landing_manifest", "landing_journey", "landing_how_it_works", "landing_register", "landing_fandom", "landing_faq", "landing_footer"]);

  const settingsMap = Object.fromEntries(
    (rows ?? []).map((r: { key: string; value: string | null }) => [r.key, r.value]),
  );

  const navbarSettings  = safeParse<LandingNavbarProps>(settingsMap["landing_navbar"], {});
  const heroSettings    = safeParse<LandingHeroProps>(settingsMap["landing_hero"], {});
  const welcomeSettings    = safeParse<LandingWelcomeProps>(settingsMap["landing_welcome"], {});
  const manifestSettings = safeParse<LandingManifestProps>(settingsMap["landing_manifest"], {});
  const journeySettings  = safeParse<LandingJourneyProps>(settingsMap["landing_journey"], {});
  const howItWorksSettings = safeParse<LandingHowItWorksProps>(settingsMap["landing_how_it_works"], {});
  const registerSettings   = safeParse<LandingRegisterProps>(settingsMap["landing_register"], {});
  const fandomSettings     = safeParse<LandingFandomProps>(settingsMap["landing_fandom"], {});
  const faqSettings        = safeParse<LandingFaqProps>(settingsMap["landing_faq"], {});
  const footerSettings     = safeParse<LandingFooterProps>(settingsMap["landing_footer"], {});
  const privacyHref = registerSettings.privacyUrl ?? GBG_PRIVACY_URL;

  const seoSettings = await fetchSeoSettings();
  const faqItems = faqSettings.items?.length ? faqSettings.items : DEFAULT_FAQ_ITEMS;
  const socialLinks = footerSettings.socialLinks?.length
    ? footerSettings.socialLinks
    : DEFAULT_SOCIAL_LINKS;

  return (
    <>
    <LandingStructuredData
      siteUrl={getSiteUrl()}
      siteName={seoSettings.siteName}
      description={seoSettings.defaultDescription}
      logoUrl={footerSettings.logoUrl ?? "/images/landing/footer/logo.png"}
      faqItems={faqItems}
      socialLinks={socialLinks}
    />
    <main id="main-content">
      <LandingNavbar     {...navbarSettings} />
      <LandingHero       {...heroSettings} />
      <LandingWelcome    {...welcomeSettings} />
      <LandingManifest   {...manifestSettings} />
      <LandingJourney    {...journeySettings} />
      <LandingHowItWorks {...howItWorksSettings} />
      <LandingRegister   {...registerSettings} />
      <LandingFandom     {...fandomSettings} />
      <LandingFaq        {...faqSettings} />
      <LandingFooter     {...footerSettings} />
    </main>
    <LandingCookieConsent privacyHref={privacyHref} />
    </>
  );
}
