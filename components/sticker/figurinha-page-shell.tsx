import Image from "next/image";
import { dashboardAssets } from "@/lib/dashboard-assets";
import { cn } from "@/lib/utils";

interface FigurinhaPageShellProps {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function FigurinhaLogoBadge() {
  return (
    <div className="flex h-[53px] w-[98px] shrink-0 items-center justify-center rounded-input bg-white">
      <div className="relative h-10 w-20">
        <Image
          src={dashboardAssets.logo}
          alt="Somos Fãs por Natureza"
          fill
          className="object-contain"
          sizes="80px"
        />
      </div>
    </div>
  );
}

export function FigurinhaPageShell({
  title = "Minha Figurinha",
  children,
  footer,
  className,
}: FigurinhaPageShellProps) {
  return (
    <section
      className={cn(
        "relative flex min-h-[calc(100dvh-4rem)] w-full flex-col overflow-hidden bg-verde-escuro-500 md:min-h-[calc(100dvh-5rem)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src={dashboardAssets.quiz.background}
          alt=""
          fill
          className="object-cover opacity-[0.35]"
          unoptimized
        />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[min(55vh,420px)] bg-no-repeat"
        style={{
          backgroundImage: `url(${dashboardAssets.album.left}), url(${dashboardAssets.album.right})`,
          backgroundPosition: "left bottom, right bottom",
          backgroundSize: "auto 100%, auto 100%",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col items-center px-6 py-8 sm:py-10">
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
          {title}
        </h1>

        <div className="flex w-full flex-1 flex-col items-center justify-center gap-8 py-8 sm:py-10">
          {children}
        </div>

        {footer ?? <FigurinhaLogoBadge />}
      </div>
    </section>
  );
}
