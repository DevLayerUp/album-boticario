"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export function LandingCta() {
  return (
    <section className="relative overflow-hidden bg-gb-green-deep py-28">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gb-green opacity-20 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-gb-green/30 bg-gb-green/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gb-green">
            <Sparkles size={12} />
            Gratuito para começar
          </span>

          <h2 className="font-display text-4xl font-black leading-tight text-white md:text-6xl">
            Comece sua coleção
            <br />
            <span className="text-gb-green">hoje mesmo</span>
          </h2>

          <p className="mx-auto mt-6 max-w-lg text-lg text-white/60">
            Crie sua conta, monte sua figurinha e abra seu primeiro pacotinho.
            É completamente grátis.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="group flex items-center gap-2 rounded-full bg-gb-green px-8 py-4 text-sm font-bold text-white shadow-xl shadow-gb-green/30 transition-all hover:bg-gb-green-dark"
            >
              Criar minha conta grátis
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-white/20 px-8 py-4 text-sm font-semibold text-white/70 transition-all hover:border-white/30 hover:text-white"
            >
              Já tenho conta
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Floating emojis */}
      {["🌿", "✨", "🌸", "🎁"].map((e, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute select-none text-4xl opacity-10"
          style={{
            left: `${[8, 88, 15, 82][i]}%`,
            top:  `${[20, 15, 70, 75][i]}%`,
          }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
        >
          {e}
        </motion.span>
      ))}
    </section>
  );
}
