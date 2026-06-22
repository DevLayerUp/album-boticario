import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Wordmark } from "@/components/brand/wordmark";

export const metadata: Metadata = { title: "Redefinir senha" };

export default function RedefinirSenhaPage() {
  return (
    <>
      <Wordmark
        tone="dark"
        subtitle="Defina sua nova senha de acesso"
        hideLogoBelowLg
        className="mb-6 flex flex-col items-center text-center lg:mb-10"
        logoClassName="h-14 w-auto"
      />
      <ResetPasswordForm />
    </>
  );
}
