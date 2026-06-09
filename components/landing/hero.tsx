"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Star } from "lucide-react";

const STICKER_FLOATS = [
  { emoji: "🌿", x: "8%",  y: "18%", size: 48, delay: 0 },
  { emoji: "🌸", x: "80%", y: "12%", size: 40, delay: 0.15 },
  { emoji: "💄", x: "70%", y: "72%", size: 44, delay: 0.3 },
  { emoji: "✨", x: "18%", y: "78%", size: 36, delay: 0.1 },
  { emoji: "🎁", x: "90%", y: "44%", size: 38, delay: 0.25 },
  { emoji: "🪷", x: "4%",  y: "52%", size: 42, delay: 0.2 },
];

export function LandingHero() {
  return (
    <section className="relative min-h-[92vh] overflow-hidden bg-gb-green-deep">

      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gb-green opacity-20 blur-[120px]" />
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-gb-gold opacity-10 blur-[80px]" />
      </div>

      {/* Floating sticker emojis */}
      {STICKER_FLOATS.map(({ emoji, x, y, size, delay }, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute select-none"
          style={{ left: x, top: y, fontSize: size }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.18, scale: 1, y: [0, -12, 0] }}
          transition={{
            opacity: { duration: 0.6, delay },
            scale: { duration: 0.6, delay },
            y: { duration: 4 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay },
          }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <span className="font-display text-xl font-bold tracking-tight text-white">
          Álbum<span className="text-gb-green">GB</span>
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full px-5 py-2 text-sm font-semibold text-white/70 transition-colors hover:text-white"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-gb-green px-5 py-2 text-sm font-bold text-white shadow-lg shadow-gb-green/30 transition-all hover:bg-gb-green-dark hover:shadow-gb-green/20"
          >
            Criar conta
          </Link>
        </div>
      </nav>

      {/* Hero content */}
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 pt-16 pb-24 text-center md:pt-24">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-gb-green/30 bg-gb-green/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gb-green"
        >
          <Sparkles size={12} />
          Álbum Digital Exclusivo
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-5xl font-black leading-tight text-white md:text-7xl"
        >
          Sua figurinha.
          <br />
          <span className="text-gb-green">Sua coleção.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-lg text-lg leading-relaxed text-white/65"
        >
          Crie sua figurinha personalizada, abra pacotinhos, complete coleções
          de O&nbsp;Boticário, Natura, Eudora e muito mais — e troque figurinhas
          com outros fãs.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.32 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/register"
            className="group flex items-center gap-2 rounded-full bg-gb-green px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-gb-green/30 transition-all hover:bg-gb-green-dark hover:shadow-gb-green/20"
          >
            Começar de graça
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#temas"
            className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white/80 backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10 hover:text-white"
          >
            Ver temas
          </a>
        </motion.div>

        {/* Social proof mini */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-12 flex items-center gap-2"
        >
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} className="fill-gb-gold text-gb-gold" />
          ))}
          <span className="ml-1 text-xs text-white/50">
            Marcas exclusivas do Grupo Boticário
          </span>
        </motion.div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path
            d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z"
            className="fill-gb-cream"
          />
        </svg>
      </div>
    </section>
  );
}
