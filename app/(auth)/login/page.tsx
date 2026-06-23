import { Suspense } from "react";
import type { Metadata } from "next";
import { buildRouteMetadata, fetchSeoSettings } from "@/lib/seo-metadata";
import { AuthForm } from "@/components/auth/auth-form";
import { Wordmark } from "@/components/brand/wordmark";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSeoSettings();
  return buildRouteMetadata(settings, "login", "/login");
}

export default function LoginPage() {
  return (
    <>
      <Wordmark
        tone="dark"
        subtitle="Entre para continuar sua coleção"
        hideLogoBelowLg
        className="mb-6 flex flex-col items-center text-center lg:mb-10"
        logoClassName="h-14 w-auto"
      />
      <Suspense fallback={<FormSkeleton />}>
        <AuthForm mode="login" />
      </Suspense>
    </>
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
