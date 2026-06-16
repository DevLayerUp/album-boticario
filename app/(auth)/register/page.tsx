import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { ReferralCapture } from "@/components/referral/referral-capture";
import { Wordmark } from "@/components/brand/wordmark";

export const metadata: Metadata = { title: "Criar conta" };

export default function RegisterPage() {
  return (
    <div className="w-full max-w-[400px]">
      <Wordmark
        tone="dark"
        subtitle="Crie sua conta e comece a colecionar"
        className="mb-8 flex flex-col items-center justify-center"
      />
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-border" />}>
        <ReferralCapture />
        <AuthForm mode="register" />
      </Suspense>
    </div>
  );
}
