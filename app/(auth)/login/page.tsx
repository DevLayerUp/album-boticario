import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { Wordmark } from "@/components/brand/wordmark";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-[400px]">
      <Wordmark
        tone="dark"
        subtitle="Entre para continuar sua coleção"
        className="mb-8 flex flex-col items-center justify-center"
      />
      <Suspense fallback={<FormSkeleton />}>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4">
      <div className="h-12 rounded-xl bg-border" />
      <div className="h-12 rounded-xl bg-border" />
      <div className="h-12 rounded-full bg-border" />
      <div className="h-px bg-border" />
      <div className="h-12 rounded-xl bg-border" />
    </div>
  );
}
