import type { Metadata } from "next";
import { buildRouteMetadata, fetchSeoSettings } from "@/lib/seo-metadata";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Wordmark } from "@/components/brand/wordmark";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSeoSettings();
  return buildRouteMetadata(settings, "esqueciSenha", "/esqueci-senha");
}

type EsqueciSenhaPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function EsqueciSenhaPage({ searchParams }: EsqueciSenhaPageProps) {
  const { error } = await searchParams;

  return (
    <>
      <Wordmark
        tone="dark"
        subtitle="Recupere o acesso à sua conta"
        hideLogoBelowLg
        className="mb-6 flex flex-col items-center text-center lg:mb-10"
        logoClassName="h-14 w-auto"
      />
      <ForgotPasswordForm linkError={error} />
    </>
  );
}
