"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { ThemeFlipCard } from "./theme-flip-card";

interface Category {
  id: number;
  name: string;
  description: string | null;
  cover_image: string | null;
}

/** Fallback cards when no categories are registered yet */
const DEMO_CATEGORIES: Category[] = [
  { id: 1, name: "O Boticário",  description: "Descubra os ícones mais amados da marca O Boticário.", cover_image: null },
  { id: 2, name: "Natura",       description: "As fragrâncias e produtos que conectam você à natureza.", cover_image: null },
  { id: 3, name: "Eudora",       description: "Elegância e modernidade em cada figurinha da coleção.", cover_image: null },
  { id: 4, name: "Quem Said,\u00a0Berenice?", description: "Cores vibrantes e personalidade única nessa coleção.", cover_image: null },
  { id: 5, name: "Vult",         description: "O melhor da maquiagem nacional em edição colecionável.", cover_image: null },
  { id: 6, name: "Especial",     description: "Figurinhas raras e exclusivas para completar o álbum.", cover_image: null },
];

export function ThemesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) && d.length > 0 ? d : DEMO_CATEGORIES))
      .catch(() => setCategories(DEMO_CATEGORIES))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section
      id="temas"
      className="relative overflow-hidden bg-gb-cream py-24"
    >
      {/* Background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #063d2b 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14 text-center"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-gb-green/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gb-green">
            <Sparkles size={12} />
            Temas do Álbum
          </span>

          <h2 className="font-display text-4xl font-bold text-gb-ink md:text-5xl">
            Explore os universos
            <br />
            <span className="text-gb-green">Grupo Boticário</span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base text-gb-slate">
            Cada marca tem seu próprio capítulo. Vire a carta para descobrir
            o que cada tema guarda — e comece a colecionar.
          </p>
        </motion.div>

        {/* Cards grid */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 size={32} className="animate-spin text-gb-green/40" />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, i) => (
              <ThemeFlipCard
                key={cat.id}
                category={cat}
                index={i}
                delay={i * 0.07}
              />
            ))}
          </div>
        )}

        {/* Hint */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-10 text-center text-xs text-gb-slate/50"
        >
          Toque em qualquer carta para virar e ver detalhes do tema
        </motion.p>
      </div>
    </section>
  );
}
