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

export function AuthBackground({ children }: AuthBackgroundProps) {
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-dvh">
      {/* ── Left brand panel (lg+) — Figma node 735:197 ─────────── */}
      <aside className="relative hidden min-h-dvh shrink-0 flex-col justify-between overflow-hidden lg:flex lg:w-[min(681px,42vw)] xl:w-[681px]">
        <div
          aria-hidden
          className="absolute inset-0 bg-verde-escuro-500 bg-cover bg-center"
          style={{
            backgroundImage: `url(${dashboardAssets.auth.loginBackground})`,
          }}
        />

        {/* Logos */}
        <motion.div
          variants={LOGO_ENTER}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex items-center gap-[46px] px-[55px] pt-[63px]"
        >
          <a
            href={FGB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Fundação Grupo Boticário — site oficial"
          >
            <Image
              src={dashboardAssets.auth.logoFgb}
              alt="Fundação Grupo Boticário"
              width={182}
              height={66}
              className="h-[66px] w-auto object-contain"
              priority
            />
          </a>
          <Link href="/" aria-label="Fãs da Natureza — página inicial">
            <Image
              src={dashboardAssets.auth.logoBranco}
              alt="Fãs da Natureza"
              width={108}
              height={53}
              className="h-[53px] w-auto object-contain"
              priority
            />
          </Link>
        </motion.div>

        {/* Brand copy */}
        <motion.div
          variants={BRAND_ENTER}
          initial="hidden"
          animate="visible"
          className="relative z-10 px-[55px]"
        >
          <h1 className="max-w-[550px] font-display text-[2.75rem] leading-[1.11] text-white xl:text-[3.375rem] xl:leading-[60px]">
            <span className="font-normal">Cuide da natureza,</span>
            <br />
            <span className="font-bold text-verde-genz">colecione</span>{" "}
            <span className="font-normal">momentos.</span>
          </h1>
          <p className="mt-6 max-w-[509px] text-lg leading-tight text-white xl:text-2xl xl:leading-[30px]">
            Descubra a biodiversidade brasileira e complete seu álbum digital dos
            Fãs por Natureza.
          </p>
        </motion.div>

        {/* Footer */}
        <p className="relative z-10 px-[55px] pb-10 text-base text-verde-300">
          © {year} Grupo Boticário · Fãs da Natureza
        </p>
      </aside>

      {/* ── Right form area ────────────────────────────────────── */}
      <main
        id="main-content"
        className="flex flex-1 flex-col items-center justify-center bg-surface px-5 py-10 sm:px-8"
      >
        {/* Mobile header (hidden on lg+) */}
        <div className="mb-8 flex flex-col items-center gap-4 lg:hidden">
          <a
            href={FGB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Fundação Grupo Boticário — site oficial"
          >
            <Image
              src={dashboardAssets.auth.logoFgb}
              alt="Fundação Grupo Boticário"
              width={182}
              height={66}
              className="h-12 w-auto object-contain"
              priority
            />
          </a>
          <Link href="/" aria-label="Fãs da Natureza — página inicial">
            <Image
              src={dashboardAssets.logo}
              alt="Fãs da Natureza"
              width={140}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {children}
      </main>
    </div>
  );
}
