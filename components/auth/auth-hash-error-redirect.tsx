"use client";

import { useEffect } from "react";

const RECOVERY_HASH_ERRORS = new Set([
  "otp_expired",
  "otp_disabled",
  "flow_state_expired",
  "flow_state_not_found",
]);

/**
 * Supabase redireciona falhas de verificação para a Site URL com erros no hash (#).
 * Encaminha para /esqueci-senha com mensagem amigável.
 */
export function AuthHashErrorRedirect() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes("error")) return;

    const params = new URLSearchParams(hash.slice(1));
    const errorCode = params.get("error_code");
    const error = params.get("error");

    const isRecoveryFailure =
      (errorCode && RECOVERY_HASH_ERRORS.has(errorCode)) ||
      error === "access_denied";

    if (!isRecoveryFailure) return;

    const target = new URL("/esqueci-senha", window.location.origin);
    target.searchParams.set("error", "link-expirado");
    window.location.replace(target.toString());
  }, []);

  return null;
}
