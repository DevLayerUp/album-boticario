"use client";

import { useEffect, useRef } from "react";
import { REFERRAL_STORAGE_KEY, normalizeReferralCode } from "@/lib/referrals";

/** Após login, tenta vincular convite salvo (ex.: cadastro via Google). */
export function ReferralClaimOnLoad() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    let code: string | null = null;
    try {
      code = normalizeReferralCode(localStorage.getItem(REFERRAL_STORAGE_KEY));
    } catch {
      return;
    }
    if (!code) return;

    void (async () => {
      try {
        const res = await fetch("/api/referrals/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        if (res.ok) {
          localStorage.removeItem(REFERRAL_STORAGE_KEY);
        }
      } catch {
        /* tenta de novo na próxima visita */
      }
    })();
  }, []);

  return null;
}
