import Image from "next/image";
import type { ContestEntry } from "@/lib/concurso";
import {
  isConcursoWindowOpen,
  resolveConcursoRegulamentoUrl,
  type ConcursoPageConfig,
} from "@/lib/concurso-page";
import { cn } from "@/lib/utils";
import { ConcursoForm, type ConcursoFormPrefill } from "./concurso-form";

const TIMELINE_ACCENTS = ["bg-verde-500", "bg-azul-500", "bg-amarelo", "bg-[#ac7f5e]"] as const;

export function ConcursoLanding({
  prefill,
  entry,
  config,
}: {
  prefill: ConcursoFormPrefill;
  entry: ContestEntry | null;
  config: ConcursoPageConfig;
}) {
  const open = isConcursoWindowOpen(config);
  const regulamentoUrl = resolveConcursoRegulamentoUrl(config);

  return (
    <div className="flex flex-col bg-[#fcfcfc]">
      <Hero config={config} />
      <Prizes config={config} />
      <HowItWorks config={config} regulamentoUrl={regulamentoUrl} />
      <FormSection prefill={prefill} entry={entry} open={open} config={config} />
      <Timeline config={config} />
    </div>
  );
}

function Highlighted({
  text,
  highlight,
  className,
}: {
  text: string;
  highlight: string;
  className: string;
}) {
  const needle = highlight.trim();
  if (!needle) return <>{text}</>;
  const index = text.toLowerCase().indexOf(needle.toLowerCase());
  if (index < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <span className={className}>{text.slice(index, index + needle.length)}</span>
      {text.slice(index + needle.length)}
    </>
  );
}

function Hero({ config }: { config: ConcursoPageConfig }) {
  const waves = [
    { src: config.images.heroWave1, className: "left-[-18%] top-[-40%] h-[70%] w-[80%] mix-blend-hard-light" },
    { src: config.images.heroWave2, className: "right-[-12%] bottom-[-20%] h-[80%] w-[55%] mix-blend-hard-light" },
    { src: config.images.heroWave3, className: "left-[-16%] bottom-[-30%] h-[90%] w-[60%] mix-blend-hard-light" },
    { src: config.images.heroWave4, className: "right-[-10%] top-[-35%] h-[70%] w-[45%] mix-blend-hard-light" },
  ];

  return (
    <section
      className="relative isolate overflow-hidden bg-verde-escuro-500 px-5 py-16 text-center sm:px-8 sm:py-20 md:py-24"
      aria-labelledby="concurso-hero-title"
    >
        {waves.map((wave) => (
        <div key={wave.src} aria-hidden className={cn("pointer-events-none absolute", wave.className)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={wave.src} alt="" className="size-full object-contain" />
        </div>
      ))}

      <div className="relative z-10 mx-auto flex max-w-[828px] flex-col items-center gap-6 md:gap-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={config.images.heroLogos}
          alt="Fundação Grupo Boticário e Fãs por Natureza"
          width={392}
          height={197}
          className="h-auto w-[220px] object-contain sm:w-[280px] md:w-[360px]"
        />

        <h1
          id="concurso-hero-title"
          className="font-display text-[1.75rem] font-semibold leading-[1.2] text-white sm:text-4xl md:text-[40px]"
        >
          <Highlighted text={config.heroTitle} highlight={config.heroHighlight} className="text-amarelo" />
        </h1>

        <p className="max-w-[605px] text-base leading-relaxed text-white sm:text-xl md:text-2xl">
          {config.heroSubtitle}
        </p>
        <p className="max-w-[605px] text-sm leading-relaxed text-white sm:text-lg md:text-xl">
          {config.heroDescription}
        </p>

        <a
          href="#formulario"
          className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-pill bg-verde-500 px-8 py-3 text-center text-base font-bold text-verde-100 transition-[filter,transform] duration-200 hover:-translate-y-px hover:brightness-95 sm:text-xl md:text-[1.7rem] md:leading-tight"
        >
          {config.heroCta}
        </a>
      </div>
    </section>
  );
}

function Prizes({ config }: { config: ConcursoPageConfig }) {
  const jersey = config.images.prizeJersey;

  return (
    <section
      className="relative overflow-hidden py-16 sm:py-20 md:py-24"
      style={{
        backgroundImage: `url(${config.images.prizesBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      aria-labelledby="concurso-podio-title"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-[6%] left-0 z-[1] hidden w-[clamp(96px,12vw,220px)] xl:block 2xl:w-[clamp(160px,16vw,380px)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={jersey} alt="" className="size-full object-cover object-[78%_center]" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-[6%] right-0 z-[1] hidden w-[clamp(96px,12vw,220px)] xl:block 2xl:w-[clamp(160px,16vw,380px)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={jersey} alt="" className="size-full object-cover object-[18%_center]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[720px] flex-col items-center gap-10 px-5 sm:max-w-[900px] sm:px-8 md:gap-12 xl:max-w-[min(1000px,70vw)] xl:gap-14 2xl:max-w-[1200px] 2xl:gap-16">
        <h2
          id="concurso-podio-title"
          className="text-center font-display text-3xl font-bold leading-tight text-verde-500 sm:text-4xl md:text-5xl 2xl:text-[58px] 2xl:leading-[66px]"
        >
          {config.prizesTitle}
        </h2>

        <p className="w-full text-left text-lg leading-snug text-foreground sm:text-2xl md:text-[28px] md:leading-10 2xl:text-[36px] 2xl:leading-[1.15]">
          <Highlighted
            text={config.prizesIntro}
            highlight={config.prizesQuestion}
            className="font-semibold text-verde-escuro-500"
          />
        </p>

        <div className="grid w-full gap-5 lg:grid-cols-3 lg:gap-5 xl:gap-6 2xl:gap-8">
          {config.prizes.map((prize, index) => {
            const medal =
              index === 0
                ? config.images.medal1
                : index === 1
                  ? config.images.medal2
                  : config.images.medal3;
            const showJersey = index < 2;
            return (
              <article
                key={`${prize.place}-${index}`}
                className={cn(
                  "relative flex items-center gap-4 overflow-hidden rounded-card bg-verde-100 px-5 py-7 shadow-card sm:gap-5 sm:px-6 sm:py-8",
                  showJersey && "lg:pr-24 2xl:pr-28",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={medal}
                  alt=""
                  width={67}
                  height={102}
                  className="h-[72px] w-auto shrink-0 object-contain sm:h-[88px] 2xl:h-[102px]"
                />
                <div className="min-w-0">
                  <h3 className="font-display text-xl font-bold text-verde-escuro-500 sm:text-2xl 2xl:text-[32px] 2xl:leading-10">
                    {prize.place}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-foreground sm:text-base sm:leading-7 2xl:text-[22px] 2xl:leading-[30px]">
                    {prize.copy}
                  </p>
                </div>
                {showJersey ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={jersey}
                    alt=""
                    width={113}
                    height={132}
                    className="pointer-events-none absolute top-4 right-2 z-[2] hidden h-[96px] w-[82px] object-contain lg:block 2xl:top-5 2xl:h-[132px] 2xl:w-[113px]"
                  />
                ) : null}
              </article>
            );
          })}
        </div>

        <p className="max-w-[640px] text-center text-base leading-7 text-foreground sm:text-[22px] sm:leading-[30px]">
          {config.prizesFooter}
        </p>

        <a
          href="#formulario"
          className="inline-flex min-h-[68px] w-full max-w-[560px] cursor-pointer items-center justify-center rounded-pill bg-amarelo px-8 py-3 text-center text-lg font-bold text-verde-escuro-500 shadow-paper transition-[filter,transform] duration-200 hover:-translate-y-px hover:brightness-95 sm:text-xl md:text-2xl"
        >
          {config.prizesCta}
        </a>
      </div>
    </section>
  );
}

function HowItWorks({
  config,
  regulamentoUrl,
}: {
  config: ConcursoPageConfig;
  regulamentoUrl: string;
}) {
  return (
    <section
      className="relative overflow-hidden bg-verde-escuro-500 px-5 py-16 sm:px-8 sm:py-20 lg:px-16"
      aria-labelledby="concurso-escalacao-title"
    >
      <div className="mx-auto grid max-w-[1680px] items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,42%)]">
        <div className="rounded-block bg-white/10 p-6 shadow-[-8px_0_0_0_var(--color-amarelo)] sm:p-10">
          <h2
            id="concurso-escalacao-title"
            className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl"
          >
            {config.howTitle}
          </h2>
          <ul className="mt-8 list-disc space-y-4 pl-6 text-base leading-snug text-white sm:text-xl sm:leading-9 md:text-2xl">
            {config.howBullets.map((bullet, index) => (
              <li key={index}>{bullet}</li>
            ))}
          </ul>
          <p className="mt-8 text-base font-medium leading-snug text-amarelo sm:text-xl md:text-2xl">
            <a
              href={regulamentoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              {config.howRegulamentoLabel}
            </a>
          </p>
        </div>

        <div className="relative mx-auto hidden h-[520px] w-full max-w-[520px] lg:block">
          <StickerCard
            src={config.images.sticker1}
            className="absolute right-0 top-0 w-[46%] -rotate-[15deg]"
          />
          <StickerCard
            src={config.images.sticker3}
            className="absolute left-2 top-[18%] w-[52%] rotate-[9deg]"
          />
          <StickerCard
            src={config.images.sticker2}
            className="absolute bottom-0 right-6 w-[54%] -rotate-[11deg]"
            caption={config.howStickerCaption}
          />
        </div>
      </div>
    </section>
  );
}

function StickerCard({
  src,
  className,
  caption,
}: {
  src: string;
  className?: string;
  caption?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-[16px] shadow-[0_4px_20px_10px_rgba(0,0,0,0.2)]", className)}>
      <div className={cn("relative", caption && "border-[5px] border-gold-700")}>
        <Image
          src={src}
          alt=""
          width={353}
          height={503}
          className="h-auto w-full object-cover"
        />
        {caption ? (
          <span className="absolute bottom-4 right-3 rounded-tl-card rounded-tr-card rounded-bl-card bg-gold-700 px-4 py-1 text-xs font-bold uppercase text-white">
            {caption}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function FormSection({
  prefill,
  entry,
  open,
  config,
}: {
  prefill: ConcursoFormPrefill;
  entry: ContestEntry | null;
  open: boolean;
  config: ConcursoPageConfig;
}) {
  return (
    <section
      id="formulario"
      className="scroll-mt-24 bg-[#f3fff0] px-5 py-16 sm:px-8 sm:py-20 md:py-24"
      aria-labelledby="concurso-form-title"
    >
      <div className="mx-auto max-w-[1200px]">
        <h2
          id="concurso-form-title"
          className="text-center font-display text-3xl font-bold leading-tight text-verde-escuro-500 sm:text-4xl md:text-5xl"
        >
          {config.formTitle}
        </h2>
        <p className="mt-3 text-center text-lg font-bold text-verde-escuro-500 sm:text-2xl md:text-[32px] md:leading-10">
          {config.formSubtitle}
        </p>
        <h3 className="mx-auto mt-10 max-w-[800px] text-center font-display text-2xl font-bold leading-tight text-verde-escuro-500 sm:text-4xl md:text-[46px] md:leading-[44px]">
          {config.formQuestion}
        </h3>
        <div className="mx-auto mt-10 max-w-[1040px]">
          <ConcursoForm prefill={prefill} initialEntry={entry} open={open} config={config} />
        </div>
      </div>
    </section>
  );
}

function Timeline({ config }: { config: ConcursoPageConfig }) {
  return (
    <section
      className="bg-[#fcfcfb] px-5 py-16 sm:px-8 sm:py-20 md:py-24"
      aria-labelledby="concurso-cronometro-title"
    >
      <div className="mx-auto max-w-[1520px]">
        <h2
          id="concurso-cronometro-title"
          className="text-center font-display text-3xl font-bold text-verde-escuro-500 sm:text-4xl md:text-5xl lg:text-[56px]"
        >
          {config.timelineTitle}
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-2 md:gap-8">
          {config.timeline.map((item, index) => (
            <article
              key={`${item.title}-${index}`}
              className="relative overflow-hidden rounded-[32px] border-2 border-verde-300 bg-white py-10 pl-8 pr-6 shadow-[0_14px_28px_-10px_rgba(13,102,50,0.14)] sm:pl-10"
            >
              <span
                aria-hidden
                className={cn("absolute inset-y-0 left-0 w-3", TIMELINE_ACCENTS[index] ?? TIMELINE_ACCENTS[0])}
              />
              <div className="flex items-start gap-5">
              <div className="relative size-16 shrink-0 sm:size-[96px] md:size-[110px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={config.images.clockBadge}
                  alt=""
                  className="absolute inset-0 size-full object-contain"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={config.images.clockIcon}
                  alt=""
                  width={52}
                  height={52}
                  className="absolute left-1/2 top-1/2 h-[42%] w-[42%] -translate-x-1/2 -translate-y-1/2 object-contain"
                />
              </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-verde-escuro-500 sm:text-[34px] sm:leading-[42px]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-[#444] sm:text-[22px] sm:leading-8 md:text-[26px] md:leading-[34px]">
                    {item.body}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
