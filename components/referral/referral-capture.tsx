"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { REFERRAL_STORAGE_KEY, normalizeReferralCode } from "@/lib/referrals";

/** Persiste ?ref=CODE no navegador até o cadastro ou claim pós-login. */
export function ReferralCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = normalizeReferralCode(searchParams.get("ref"));
    if (code) {
      try {
        localStorage.setItem(REFERRAL_STORAGE_KEY, code);
      } catch {
        /* storage indisponível */
      }
    }
  }, [searchParams]);

  return null;
}
