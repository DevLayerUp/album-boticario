"use client";

import { motion } from "framer-motion";
import { Camera, Package, Repeat2, Trophy, BookOpen, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: Camera,
    color: "#00a859",
    title: "Figurinha personalizada",
    description:
      "Envie sua foto e crie uma figurinha única com seu rosto. Remova o fundo automaticamente.",
  },
  {
    icon: Package,
    color: "#d9a441",
    title: "Abra pacotinhos",
    description:
      "Ganhe pacotinhos respondendo quizzes e completando missões. Cada abertura é uma surpresa.",
  },
  {
    icon: BookOpen,
    color: "#2d8ab8",
    title: "Álbum interativo",
    description:
      "Cole suas figurinhas nas páginas do álbum com animações. Veja o progresso de cada coleção.",
  },
  {
    icon: Repeat2,
    color: "#9b2ec8",
    title: "Sistema de trocas",
    description:
      "Troque figurinhas duplicadas com outros colecionadores. Encontre quem tem o que falta.",
  },
  {
    icon: Trophy,
    color: "#c0392b",
    title: "Missões e conquistas",
    description:
      "Complete desafios diários, suba no ranking e desbloqueie recompensas exclusivas.",
  },
  {
    icon: Zap,
    color: "#063d2b",
    title: "Quizzes temáticos",
    description:
      "Responda quizzes sobre as marcas do Grupo Boticário e ganhe pacotinhos como recompensa.",
  },
];

export function LandingFeatures() {
  return (
    <section className="bg-gb-cream py-24">
      <div className="mx-auto max-w-6xl px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14 text-center"
        >
          <h2 className="font-display text-4xl font-bold text-gb-ink md:text-5xl">
            Tudo que um álbum
            <br />
            <span className="text-gb-green">precisa ter</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-gb-slate">
            Uma experiência completa de colecionismo digital criada especialmente
            para os fãs do Grupo Boticário.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, color, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="group rounded-3xl border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div
                className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${color}18` }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <h3 className="font-display text-lg font-bold text-gb-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gb-slate">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
