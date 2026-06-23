import type { Metadata } from "next";
import { buildRouteMetadata, fetchSeoSettings } from "@/lib/seo-metadata";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Wordmark } from "@/components/brand/wordmark";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSeoSettings();
  return buildRouteMetadata(settings, "redefinirSenha", "/redefinir-senha");
}

export default function RedefinirSenhaPage() {
  return (
    <>
      <Wordmark
        tone="dark"
        subtitle="Defina sua nova senha de acesso"
        hideLogoBelowLg
        className="mb-6 flex flex-col items-center text-center lg:mb-10"
        logoClassName="h-14 w-auto"
      />
      <ResetPasswordForm />
    </>
  );
}
