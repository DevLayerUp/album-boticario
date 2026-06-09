import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LandingHero } from "@/components/landing/hero";
import { LandingFeatures } from "@/components/landing/features";
import { ThemesSection } from "@/components/landing/themes-section";
import { LandingCta } from "@/components/landing/cta";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Álbum Digital de Figurinhas — Grupo Boticário",
  description:
    "Crie sua figurinha personalizada, abra pacotinhos, complete coleções e troque figurinhas com outros fãs do Grupo Boticário.",
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Authenticated users go straight to the dashboard
  if (user) redirect("/dashboard");

  return (
    <main id="main-content">
      <LandingHero />
      <LandingFeatures />
      <ThemesSection />
      <LandingCta />
    </main>
  );
}
