import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Wordmark } from "@/components/brand/wordmark";

export const metadata: Metadata = { title: "Esqueci minha senha" };

export default function EsqueciSenhaPage() {
  return (
    <>
      <Wordmark
        tone="dark"
        subtitle="Recupere o acesso à sua conta"
        hideLogoBelowLg
        className="mb-6 flex flex-col items-center text-center lg:mb-10"
        logoClassName="h-14 w-auto"
      />
      <ForgotPasswordForm />
    </>
  );
}
