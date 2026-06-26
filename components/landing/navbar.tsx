"use client";

import Link from "next/link";
import { LandingImage } from "@/components/landing/landing-image";
import { useCallback, useEffect, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";

export interface NavLink {
  label: string;
  href: string;
}

export interface LandingNavbarProps {
  logoUrl?:     string | null;
  fgbLogoUrl?:  string | null;
  fgbLogoHref?: string;
  links?:       NavLink[];
  ctaLabel?:    string;
  ctaHref?:     string;
}

const DEFAULT_LINKS: NavLink[] = [
  { label: "Conheça o Álbum da Natureza", href: "#album" },
  { label: "Projeto Fãs por Natureza", href: "#projeto" },
  { label: "FAQ", href: "#faq" },
];

const DEFAULT_FGB_LOGO = "/images/landing/footer/logo.png";
const DEFAULT_FGB_HREF = "https://fundacaogrupoboticario.org.br/";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const drawerVariants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: { type: "spring", damping: 32, stiffness: 340, mass: 0.85 },
  },
  exit: {
    x: "100%",
    transition: { duration: 0.28, ease: EASE_OUT },
  },
};

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.12 },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.03, staggerDirection: -1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.28, ease: EASE_OUT },
  },
  exit: { opacity: 0, x: 12, transition: { duration: 0.15 } },
};

const ctaVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: EASE_OUT, delay: 0.2 },
  },
  exit: { opacity: 0, y: 8, transition: { duration: 0.15 } },
};

function MobileMenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block size-5" aria-hidden>
      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <motion.span
            key="close"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
          >
            <X size={20} strokeWidth={2.25} />
          </motion.span>
        ) : (
          <motion.span
            key="menu"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, rotate: 90, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.8 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
          >
            <Menu size={20} strokeWidth={2.25} />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

interface MobileNavMenuProps {
  open: boolean;
  menuId: string;
  navLinks: NavLink[];
  ctaLabel: string;
  ctaHref: string;
  onClose: () => void;
  reducedMotion: boolean | null;
}

function MobileNavMenu({
  open,
  menuId,
  navLinks,
  ctaLabel,
  ctaHref,
  onClose,
  reducedMotion,
}: MobileNavMenuProps) {
  const instant = reducedMotion ? { duration: 0 } : undefined;
  const drawerTransition = reducedMotion
    ? { duration: 0 }
    : undefined;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Fechar menu"
            className="fixed inset-0 z-60 bg-verde-escuro-500/30 backdrop-blur-xs lg:hidden"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={instant ?? { duration: 0.3 }}
            onClick={onClose}
          />

          <motion.aside
            id={menuId}
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            className="fixed inset-y-0 right-0 z-70 flex w-[min(100%,20rem)] flex-col border-l border-verde-300/50 bg-verde-100 shadow-[-12px_0_40px_rgba(5,46,4,0.14)] sm:w-80 lg:hidden"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={drawerTransition}
          >
            {/* Drawer header */}
            <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-verde-300/40 px-5">
              <span className="font-display text-lg font-bold text-verde-escuro-500">
                Menu
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar menu"
                className="flex size-11 cursor-pointer items-center justify-center rounded-xl text-verde-escuro-500 transition-colors duration-200 hover:bg-verde-escuro-500/10 active:bg-verde-escuro-500/15"
              >
                <X size={20} strokeWidth={2.25} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-6">
              <motion.nav
                aria-label="Links do menu"
                variants={listVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={instant}
              >
                <ul className="flex flex-col gap-1" role="list">
                  {navLinks.map((link) => (
                    <motion.li key={link.href} variants={itemVariants}>
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className="flex min-h-11 cursor-pointer items-center rounded-card px-4 py-3 text-base font-medium text-verde-escuro-500 transition-colors duration-200 hover:bg-verde-escuro-500/8 hover:text-verde-500 active:bg-verde-escuro-500/12"
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.nav>

              <motion.div
                variants={ctaVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={instant}
                className="mt-auto border-t border-verde-300/40 pt-6"
              >
                <Link
                  href={ctaHref}
                  onClick={onClose}
                  className="flex min-h-11 w-full cursor-pointer items-center justify-center rounded-pill bg-verde-escuro-500 px-6 py-3 text-base font-medium text-verde-100 shadow-[0_8px_24px_rgba(13,102,50,0.25)] transition-colors duration-200 hover:bg-verde-500 active:bg-verde-escuro-400"
                >
                  {ctaLabel}
                </Link>
              </motion.div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function LandingNavbar({
  logoUrl,
  fgbLogoUrl,
  fgbLogoHref = DEFAULT_FGB_HREF,
  links,
  ctaLabel = "Quero participar!",
  ctaHref = "/register",
}: LandingNavbarProps) {
  const navLinks = links?.length ? links : DEFAULT_LINKS;
  const displayFgbLogo = fgbLogoUrl ?? DEFAULT_FGB_LOGO;
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuId = useId();
  const reducedMotion = useReducedMotion();

  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const toggleMobile = useCallback(() => setMobileOpen((v) => !v), []);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobile();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen, closeMobile]);

  return (
    <header className="sticky top-0 z-50 bg-verde-100">
      <nav
        className="mx-auto flex h-[72px] max-w-[1680px] items-center justify-between px-6 md:px-10 lg:px-16"
        aria-label="Navegação principal"
      >
        {/* Logos — Fãs por Natureza + Fundação Grupo Boticário (mesmo padrão do dashboard) */}
        <div className="flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-4">
          <Link href="/" className="flex shrink-0 items-center" aria-label="Fãs por Natureza — início">
            {logoUrl ? (
              <LandingImage
                src={logoUrl}
                alt="Fãs por Natureza"
                width={145}
                height={73}
                className="h-10 w-auto object-contain md:h-[48px]"
                priority
              />
            ) : (
              <span className="font-display text-xl font-bold text-verde-escuro-500">
                Fãs por <span className="text-verde-500">Natureza</span>
              </span>
            )}
          </Link>

          <span
            className="h-8 w-px shrink-0 bg-border sm:h-10"
            aria-hidden
          />

          <a
            href={fgbLogoHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Fundação Grupo Boticário — site oficial"
            className="shrink-0"
          >
            <LandingImage
              src={displayFgbLogo}
              alt="Fundação Grupo Boticário"
              width={182}
              height={66}
              className="h-9 w-auto max-w-[120px] object-contain sm:h-11 lg:max-w-[140px]"
              priority
            />
          </a>
        </div>

        {/* Desktop nav links */}
        <ul className="hidden items-center gap-1 lg:flex" role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-pill px-5 py-2 text-sm font-medium text-verde-escuro-500 transition-colors hover:bg-verde-escuro-500/8 hover:text-verde-500 sm:px-6 sm:text-base"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA + mobile toggle */}
        <div className="flex items-center gap-3">
          <Link
            href={ctaHref}
            className="hidden rounded-pill bg-verde-escuro-500 px-6 py-2 text-sm font-medium text-verde-100 transition-colors hover:bg-verde-500 sm:inline-flex sm:px-7 sm:text-base"
          >
            {ctaLabel}
          </Link>

          <button
            type="button"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
            aria-controls={menuId}
            onClick={toggleMobile}
            className="flex size-11 cursor-pointer items-center justify-center rounded-xl text-verde-escuro-500 transition-colors duration-200 hover:bg-verde-escuro-500/10 active:bg-verde-escuro-500/15 lg:hidden"
          >
            <MobileMenuIcon open={mobileOpen} />
          </button>
        </div>
      </nav>

      <MobileNavMenu
        open={mobileOpen}
        menuId={menuId}
        navLinks={navLinks}
        ctaLabel={ctaLabel}
        ctaHref={ctaHref}
        onClose={closeMobile}
        reducedMotion={reducedMotion}
      />
    </header>
  );
}
