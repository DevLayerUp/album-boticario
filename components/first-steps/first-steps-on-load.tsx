"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FirstStepsConfig } from "@/lib/first-steps";
import { FirstStepsModal } from "./first-steps-modal";

interface FirstStepsResponse {
  config: FirstStepsConfig;
  completed: boolean;
}

export function FirstStepsOnLoad() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<FirstStepsConfig | null>(null);
  const ran = useRef(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/first-steps");
      if (!res.ok) return;
      const data = (await res.json()) as FirstStepsResponse;
      if (!data.config.enabled || data.completed) return;
      setConfig(data.config);
      setOpen(true);
    } catch {
      /* silencioso — não bloqueia o dashboard */
    }
  }, []);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const run = () => void load();
    if (typeof requestIdleCallback !== "undefined") {
      const idleId = requestIdleCallback(run, { timeout: 4000 });
      return () => cancelIdleCallback(idleId);
    }

    const timeoutId = setTimeout(run, 2000);
    return () => clearTimeout(timeoutId);
  }, [load]);

  if (!open || !config) return null;

  return (
    <FirstStepsModal
      config={config}
      onComplete={() => {
        setOpen(false);
        setConfig(null);
      }}
    />
  );
}
