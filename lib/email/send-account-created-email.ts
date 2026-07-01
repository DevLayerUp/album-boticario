/** Dispara o e-mail de conta criada sem bloquear o fluxo de cadastro. */
export async function sendAccountCreatedEmail(
  email: string,
  name?: string,
): Promise<void> {
  try {
    await fetch("/api/auth/account-created", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    });
  } catch {
    /* cadastro segue mesmo se o e-mail falhar */
  }
}
