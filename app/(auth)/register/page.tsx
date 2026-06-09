import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { Card, CardContent } from "@/components/ui/card";
import { Wordmark } from "@/components/brand/wordmark";

export const metadata: Metadata = { title: "Criar conta" };

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-8">
      <Wordmark subtitle="Crie sua conta e comece a colecionar" />
      <Card>
        <CardContent className="pt-6">
          <Suspense fallback={<div className="h-64" />}>
            <AuthForm mode="register" />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
