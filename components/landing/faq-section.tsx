"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────────────── */
export interface FaqItem {
  question: string;
  answer:   string;
}

export interface LandingFaqProps {
  eyebrow?: string;
  title?:   string;
  items?:   FaqItem[];
}

/* ─── Defaults ───────────────────────────────────────────────────────────── */
export const DEFAULT_FAQ_ITEMS: FaqItem[] = [
  {
    question: "O álbum é gratuito?",
    answer:   "Sim. Basta realizar seu cadastro para começar a colecionar.",
  },
  {
    question: "Como consigo novas figurinhas?",
    answer:
      "Ao participar da campanha, você recebe pacotinhos virtuais para abrir e descobrir novas figurinhas no álbum.",
  },
  {
    question: "Posso trocar figurinhas repetidas?",
    answer:
      "Sim! A plataforma permite trocar figurinhas repetidas com outros colecionadores da comunidade.",
  },
  {
    question: "Preciso completar o álbum sozinho?",
    answer:
      "Não. Você pode trocar figurinhas com a comunidade para completar sua coleção mais rápido.",
  },
  {
    question: "O que é o movimento Fãs por Natureza?",
    answer:
      "É uma comunidade de pessoas apaixonadas pela natureza brasileira, reunidas para aprender, compartilhar e defender a biodiversidade.",
  },
];

/* ─── Main component ─────────────────────────────────────────────────────── */
export function LandingFaq({
  eyebrow = "PERGUNTAS FREQUENTES",
  title   = "Perguntas frequentes",
  items,
}: LandingFaqProps) {
  const faqItems = items?.length ? items : DEFAULT_FAQ_ITEMS;
  const [openIndex, setOpenIndex] = useState(0);

  function toggle(index: number) {
    setOpenIndex((current) => (current === index ? -1 : index));
  }

  return (
    <section
      id="faq"
      className="bg-[#e5eee9] py-16 md:py-24 lg:py-[152px]"
      aria-label="Perguntas frequentes"
    >
      <div className="mx-auto flex max-w-[870px] flex-col items-center gap-12 px-6 md:gap-[66px] md:px-12">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex max-w-[581px] flex-col items-center gap-2.5 text-center"
        >
          <p className="w-full text-sm font-medium uppercase leading-7 tracking-[2px] text-verde-400 sm:text-base lg:text-[20px]">
            {eyebrow}
          </p>
          <h2 className="w-full font-display text-[28px] font-bold leading-[1.4] text-verde-escuro-500 sm:text-[32px] md:text-[36px] lg:text-[40px] xl:text-[48px]">
            {title}
          </h2>
        </motion.header>

        {/* Accordion */}
        <div className="flex w-full flex-col gap-[31px]">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;

            return (
              <motion.div
                key={`${item.question}-${index}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="w-full"
              >
                <div
                  className={[
                    "backdrop-blur-[8px] rounded-2xl p-6 transition-colors",
                    isOpen ? "bg-white" : "bg-white/60",
                  ].join(" ")}
                >
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(index)}
                    className="flex w-full items-start justify-between gap-4 text-left"
                  >
                    <span className="flex-1 text-lg font-bold leading-snug text-[#2e2e2e] sm:text-xl lg:text-[22px] lg:leading-9">
                      {item.question}
                    </span>
                    <ChevronDown
                      size={22}
                      strokeWidth={2}
                      className={[
                        "mt-2 shrink-0 text-[#2e2e2e]/50 transition-transform duration-200",
                        isOpen ? "rotate-180" : "rotate-0",
                      ].join(" ")}
                      aria-hidden
                    />
                  </button>

                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    hidden={!isOpen}
                    className={isOpen ? "mt-2 block" : "hidden"}
                  >
                    <p className="text-sm leading-6 text-[#2e2e2e] sm:text-base">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
