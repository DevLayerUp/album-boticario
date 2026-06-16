"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const BRAND_ENTER = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const LOGO_ENTER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, delay: 0.2 } },
};

interface AuthBackgroundProps {
  children: React.ReactNode;
}

export function AuthBackground({ children }: AuthBackgroundProps) {
  return (
    <div className="flex min-h-dvh">
      {/* ── Left brand panel (lg+) ─────────────────────────────── */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-verde-escuro-capa px-10 py-10 lg:flex lg:w-[44%] xl:w-[480px]">
        {/* Animated grid lines */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <span className="auth-hline" style={{ top: "22%", animationDelay: "0.15s" }} />
          <span className="auth-hline" style={{ top: "50%", animationDelay: "0.4s" }} />
          <span className="auth-hline" style={{ top: "78%", animationDelay: "0.65s" }} />
          <span className="auth-vline" style={{ left: "38%", animationDelay: "0.3s" }} />
          <span className="auth-vline" style={{ left: "72%", animationDelay: "0.55s" }} />
        </div>

        {/* Decorative blobs */}
        <div
          className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-verde-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-16 -right-16 h-96 w-96 rounded-full bg-verde-escuro-500/50 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute left-1/2 top-2/5 h-56 w-56 -translate-x-1/2 rounded-full bg-verde-genz/10 blur-2xl"
          aria-hidden="true"
        />

        {/* Logo */}
        <motion.div
          variants={LOGO_ENTER}
          initial="hidden"
          animate="visible"
          className="relative z-10 shrink-0"
        >
          <Link href="/" aria-label="Voltar ao início">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/dashboard/logo-branco.png"
              alt="Fãs da Natureza"
              className="h-12 w-auto object-contain"
            />
          </Link>
        </motion.div>

        {/* Brand copy */}
        <motion.div
          variants={BRAND_ENTER}
          initial="hidden"
          animate="visible"
          className="relative z-10"
        >
          <p className="font-display text-[2.6rem] font-bold leading-[1.18] text-white">
            Cuide da
            <br />
            natureza,{" "}
            <span className="text-verde-genz">colecione</span>
            <br />
            momentos.
          </p>
          <p className="mt-5 text-sm leading-relaxed text-verde-escuro-200">
            Descubra a biodiversidade brasileira e complete seu álbum digital dos Fãs por Natureza.
          </p>

          {/* Decorative accent pill */}
          <div className="mt-8 flex items-center gap-3">
            <span className="h-px w-8 bg-verde-500" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-verde-escuro-300">
              Grupo Boticário
            </span>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="relative z-10 text-xs text-verde-escuro-300">
          © {new Date().getFullYear()} Grupo Boticário · Fãs da Natureza
        </p>
      </aside>

      {/* ── Right form area ────────────────────────────────────── */}
      <main
        id="main-content"
        className="flex flex-1 flex-col items-center justify-center bg-background px-5 py-10 sm:px-8"
      >
        {/* Mobile logo (hidden on lg+) */}
        <div className="mb-8 flex flex-col items-center justify-center lg:hidden" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/dashboard/logo.png"
            alt="Fãs da Natureza"
            className="mx-auto h-10 w-auto object-contain"
          />
        </div>

        {children}
      </main>
    </div>
  );
}
