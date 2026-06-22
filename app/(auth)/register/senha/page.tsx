import { Suspense } from "react";
import type { Metadata } from "next";
import { LandingPasswordForm } from "@/components/auth/landing-password-form";
import { ReferralCapture } from "@/components/referral/referral-capture";
import { Wordmark } from "@/components/brand/wordmark";

export const metadata: Metadata = { title: "Criar senha" };

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
