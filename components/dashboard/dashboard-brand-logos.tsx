import Link from "next/link";
import Image from "next/image";
import { Wordmark } from "@/components/brand/wordmark";

const FGB_URL = "https://fundacaogrupoboticario.org.br/";
const FGB_LOGO = "/images/landing/footer/logo.png";

export function DashboardBrandLogos() {
  return (
    <div className="flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-4">
      <Link
        href="/dashboard"
        className="flex shrink-0 items-center"
        aria-label="Fãs da Natureza — início"
      >
        <Wordmark
          tone="dark"
          className="text-left"
          logoClassName="h-10 w-auto sm:h-12"
        />
      </Link>

      <span
        className="h-8 w-px shrink-0 bg-border sm:h-10"
        aria-hidden
      />

      <a
        href={FGB_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Fundação Grupo Boticário — site oficial"
        className="shrink-0"
      >
        <Image
          src={FGB_LOGO}
          alt="Fundação Grupo Boticário"
          width={182}
          height={66}
          className="h-9 w-auto max-w-[120px] object-contain sm:h-11 sm:max-w-none"
          priority
        />
      </a>
    </div>
  );
}
