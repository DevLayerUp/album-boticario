import { Suspense } from "react";
import type { Metadata } from "next";
import { LandingPasswordForm } from "@/components/auth/landing-password-form";
import { ReferralCapture } from "@/components/referral/referral-capture";
import { Wordmark } from "@/components/brand/wordmark";

export const metadata: Metadata = { title: "Criar senha" };

export default function RegisterPasswordPage() {
  return (
    <div className="w-full max-w-[400px]">
      <Wordmark
        tone="dark"
        subtitle="Último passo: defina sua senha de acesso"
        className="mb-8 flex flex-col items-center justify-center"
      />
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-border" />}>
        <ReferralCapture />
        <LandingPasswordForm />
      </Suspense>
    </div>
  );
}
