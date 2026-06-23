import { Suspense } from "react";
import type { Metadata } from "next";
import { buildRouteMetadata, fetchSeoSettings } from "@/lib/seo-metadata";
import { LandingPasswordForm } from "@/components/auth/landing-password-form";
import { ReferralCapture } from "@/components/referral/referral-capture";
import { Wordmark } from "@/components/brand/wordmark";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSeoSettings();
  return buildRouteMetadata(settings, "registerSenha", "/register/senha");
}

export default function RegisterPasswordPage() {
  return (
    <>
      <Wordmark
        tone="dark"
        subtitle="Último passo: defina sua senha de acesso"
        hideLogoBelowLg
        className="mb-6 flex flex-col items-center text-center lg:mb-8"
        logoClassName="h-14 w-auto"
      />
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-border" />}>
        <ReferralCapture />
        <LandingPasswordForm />
      </Suspense>
    </>
  );
}
