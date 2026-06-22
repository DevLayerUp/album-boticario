import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { ReferralCapture } from "@/components/referral/referral-capture";
import { Wordmark } from "@/components/brand/wordmark";

export const metadata: Metadata = { title: "Criar conta" };

export default function RegisterPage() {
  return (
    <>
      <Wordmark
        tone="dark"
        subtitle="Crie sua conta e comece a colecionar"
        hideLogoBelowLg
        className="mb-6 flex flex-col items-center text-center lg:mb-8"
        logoClassName="h-14 w-auto"
      />
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-border" />}>
        <ReferralCapture />
        <AuthForm mode="register" />
      </Suspense>
    </>
  );
}
