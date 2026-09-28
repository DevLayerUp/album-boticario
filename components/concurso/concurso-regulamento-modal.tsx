"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CONCURSO_REGULAMENTO_PROMOTORA,
  CONCURSO_REGULAMENTO_SECTIONS,
  CONCURSO_REGULAMENTO_SUBTITLE,
  CONCURSO_REGULAMENTO_TITLE,
  type RegulamentoBlock,
} from "@/lib/concurso-regulamento";
import { cn } from "@/lib/utils";

const LINK_SPLIT =
  /(https?:\/\/[^\s)]+|(?:[\w.+-]+@[\w-]+\.[\w.-]+))/g;

function LinkedText({ text }: { text: string }) {
  const parts = text.split(LINK_SPLIT);
  return (
    <>
      {parts.map((part, index) => {
        if (/^https?:\/\//.test(part)) {
          const href = part.replace(/[.,;:]+$/, "");
          const trailing = part.slice(href.length);
          return (
            <span key={`${href}-${index}`}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="break-words font-semibold text-verde-escuro-500 underline underline-offset-2"
              >
                {href}
              </a>
              {trailing}
            </span>
          );
        }
        if (part.includes("@") && /^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(part)) {
          return (
            <a
              key={`${part}-${index}`}
              href={`mailto:${part}`}
              className="break-words font-semibold text-verde-escuro-500 underline underline-offset-2"
            >
              {part}
            </a>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

function Block({ block }: { block: RegulamentoBlock }) {
  if (block.type === "list") {
    return (
      <ul className="list-disc space-y-2 pl-5 marker:text-verde-500">
        {block.items.map((item, index) => (
          <li key={index}>
            <LinkedText text={item} />
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "quote") {
    return (
      <p className="border-l-4 border-amarelo pl-4 font-semibold italic text-verde-escuro-500">
        “{block.text}”
      </p>
    );
  }

  return (
    <p>
      <LinkedText text={block.text} />
    </p>
  );
}

export function ConcursoRegulamentoModal({ onClose }: { onClose: () => void }) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        aria-label="Fechar regulamento"
        className="absolute inset-0 cursor-pointer bg-[#0d6632]/35 backdrop-blur-[6px]"
        onClick={onClose}
      />

      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={
          reduceMotion
            ? { duration: 0.2 }
            : { type: "spring", stiffness: 320, damping: 28 }
        }
        className="relative flex max-h-[min(92dvh,920px)] w-full max-w-[760px] flex-col overflow-hidden rounded-t-card bg-[#fcfcfb] shadow-[0_20px_48px_rgba(13,102,50,0.22)] sm:rounded-card"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="relative shrink-0 border-b border-verde-100 bg-verde-escuro-500 px-5 py-4 pr-14 sm:px-8 sm:py-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amarelo">
            {CONCURSO_REGULAMENTO_SUBTITLE}
          </p>
          <h2
            id={titleId}
            className="mt-1 font-display text-xl font-bold leading-tight text-white sm:text-2xl"
          >
            {CONCURSO_REGULAMENTO_TITLE}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amarelo"
            aria-label="Fechar"
          >
            <X aria-hidden className="size-6" strokeWidth={2.2} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-8 sm:py-6">
          <p className="text-sm leading-relaxed text-verde-escuro-500 sm:text-[15px] sm:leading-7">
            <LinkedText text={CONCURSO_REGULAMENTO_PROMOTORA} />
          </p>

          <div className="mt-6 flex flex-col gap-8">
            {CONCURSO_REGULAMENTO_SECTIONS.map((section) => (
              <section key={section.id} aria-labelledby={`reg-${section.id}`}>
                <h3
                  id={`reg-${section.id}`}
                  className="font-display text-lg font-bold leading-snug text-verde-500 sm:text-xl"
                >
                  {section.title}
                </h3>
                <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-black sm:text-[15px] sm:leading-7">
                  {section.blocks.map((block, index) => (
                    <Block key={`${section.id}-${index}`} block={block} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="shrink-0 border-t border-verde-100 bg-white px-5 py-3 sm:px-8 sm:py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-pill bg-amarelo px-6 text-base font-bold text-verde-escuro-500 shadow-[0_8px_18px_rgba(13,102,50,0.12)] transition-[filter,transform] duration-200 hover:brightness-95 motion-safe:hover:-translate-y-px sm:text-lg"
          >
            Fechar regulamento
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ConcursoRegulamentoLink({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        className={cn("cursor-pointer bg-transparent p-0 text-left text-inherit", className)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
      >
        {children}
      </button>
      {open
        ? createPortal(<ConcursoRegulamentoModal onClose={() => setOpen(false)} />, document.body)
        : null}
    </>
  );
}
