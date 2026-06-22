/** Traduz mensagens comuns do Supabase Auth para português. */
export function traduzErroAuth(message: string): string {
  if (message.includes("Invalid login credentials"))
    return "E-mail ou senha incorretos.";
  if (message.includes("already registered"))
    return "Este e-mail já está cadastrado.";
  if (message.includes("Email not confirmed"))
    return "Confirme seu e-mail antes de entrar.";
  if (message.includes("Password should be at least"))
    return "A senha deve ter pelo menos 6 caracteres.";
  if (message.includes("New password should be different"))
    return "A nova senha deve ser diferente da atual.";
  if (message.includes("Auth session missing"))
    return "Link inválido ou expirado. Solicite uma nova redefinição de senha.";
  if (message.includes("Email rate limit exceeded"))
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  if (message.includes("For security purposes"))
    return "Por segurança, aguarde alguns segundos antes de tentar novamente.";
  return message;
}
