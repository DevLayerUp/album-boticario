import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { Card, CardContent } from "@/components/ui/card";
import { Wordmark } from "@/components/brand/wordmark";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-8">
      <Wordmark subtitle="Entre para continuar sua coleção" />
      <Card>
        <CardContent className="pt-6">
          <Suspense fallback={<FormSkeleton />}>
            <AuthForm mode="login" />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4">
      <div className="h-12 rounded-full bg-border" />
      <div className="h-12 rounded-xl bg-border" />
      <div className="h-12 rounded-xl bg-border" />
      <div className="h-12 rounded-full bg-border" />
    </div>
  );
}
