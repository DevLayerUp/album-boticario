"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { dashboardAssets } from "@/lib/dashboard-assets";

const BRAND_ENTER = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

const LOGO_ENTER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, delay: 0.15 } },
};

const FGB_URL = "https://fundacaogrupoboticario.org.br/";

interface AuthBackgroundProps {
  children: React.ReactNode;
}

function AuthLogoFgb({ className }: { className?: string }) {
  return (
    <a
      href={FGB_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fundação Grupo Boticário — site oficial"
      className="shrink-0"
    >
      <Image
        src={dashboardAssets.auth.logoFgb}
        alt="Fundação Grupo Boticário"
        width={182}
        height={66}
        className={className}
        priority
      />
    </a>
  );
}

function AuthLogoFans({
  className,
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  const src =
    variant === "light"
      ? dashboardAssets.auth.logoBranco
      : dashboardAssets.logo;

  return (
    <Link
      href="/"
      aria-label="Fãs por Natureza — página inicial"
      className="shrink-0"
    >
      <Image
        src={src}
        alt="Fãs por Natureza"
        width={variant === "light" ? 108 : 140}
        height={variant === "light" ? 53 : 40}
        className={className}
        priority
      />
    </Link>
  );
}

export function AuthBackground({ children }: AuthBackgroundProps) {
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* ── Mobile brand bar (lg-) ───────────────────────────────── */}
      <header className="relative shrink-0 overflow-hidden lg:hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-verde-escuro-500 bg-cover bg-center"
          style={{
            backgroundImage: `url(${dashboardAssets.auth.loginBackground})`,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-verde-escuro-500/35"
        />

        <div className="relative z-10 flex items-center justify-center gap-5 px-4 py-5 sm:gap-8 sm:px-6 sm:py-6">
          <AuthLogoFgb className="h-10 w-auto object-contain sm:h-11" />
          <span
            aria-hidden
            className="h-9 w-px shrink-0 bg-white/25 sm:h-10"
          />
          <AuthLogoFans
            variant="light"
            className="h-8 w-auto object-contain sm:h-9"
          />
        </div>
      </header>

      {/* ── Desktop left panel (lg+) — Figma node 735:197 ───────── */}
      <aside className="relative hidden min-h-dvh shrink-0 flex-col justify-between overflow-hidden lg:flex lg:w-[min(681px,42vw)] xl:w-[681px]">
        <div
          aria-hidden
          className="absolute inset-0 bg-verde-escuro-500 bg-cover bg-center"
          style={{
            backgroundImage: `url(${dashboardAssets.auth.loginBackground})`,
          }}
        />

        <motion.div
          variants={LOGO_ENTER}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex items-center gap-[46px] px-[55px] pt-[63px]"
        >
          <AuthLogoFgb className="h-[66px] w-[220px] object-contain" />
          <AuthLogoFans
            variant="light"
            className="h-[53px] w-auto object-contain"
          />
        </motion.div>

        <motion.div
          variants={BRAND_ENTER}
          initial="hidden"
          animate="visible"
          className="relative z-10 px-[55px]"
        >
          <h1 className="max-w-[550px] font-display text-[2rem] leading-[1.12] text-white lg:text-[2.125rem] xl:text-[2.5rem] xl:leading-[1.12] 2xl:text-[3.375rem] 2xl:leading-[60px]">
            <span className="font-normal">Complete o álbum.</span>
            <br />
            <span className="font-bold text-verde-genz">Seja um Fã por natureza!</span>{" "}
          </h1>
          <p className="mt-5 max-w-[509px] text-base leading-snug text-white lg:text-[1.0625rem] xl:mt-6 xl:text-lg xl:leading-relaxed 2xl:text-2xl 2xl:leading-[30px]">
            Descubra a biodiversidade brasileira e colecione figurinhas no seu álbum digital dos Fãs por Natureza.
          </p>
        </motion.div>

        <p className="relative z-10 px-[55px] pb-10 text-base text-verde-300">
          © {year} Grupo Boticário · Fãs por Natureza
        </p>
      </aside>

      {/* ── Form area ──────────────────────────────────────────── */}
      <main
        id="main-content"
        className="flex flex-1 flex-col items-center justify-center bg-surface px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10"
      >
        <div className="w-full max-w-[420px]">{children}</div>
      </main>
    </div>
  );
}
