"use client";

import { useRouter } from "next/navigation";
import {
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type TouchEvent,
} from "react";
import { cn } from "@/lib/utils";

function blockFlipGesture(e: PointerEvent | TouchEvent) {
  e.stopPropagation();
}

interface FlipBookLinkProps {
  href: string;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}

/** Link seguro dentro do react-pageflip — não dispara virada de página no mobile. */
export function FlipBookLink({
  href,
  className,
  ariaLabel,
  children,
}: FlipBookLinkProps) {
  const router = useRouter();
  const isExternal = /^https?:\/\//i.test(href);

  function activate(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (isExternal) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    router.push(href);
  }

  return (
    <a
      href={href}
      aria-label={ariaLabel}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      onPointerDown={blockFlipGesture}
      onTouchStart={blockFlipGesture}
      onClick={activate}
      className={cn("touch-manipulation", className)}
    >
      {children}
    </a>
  );
}

interface FlipBookHtmlContentProps {
  html: string;
  className?: string;
}

/** HTML do admin com links clicáveis dentro do flipbook. */
export function FlipBookHtmlContent({ html, className }: FlipBookHtmlContentProps) {
  const router = useRouter();

  function blockLinkGesture(e: PointerEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("a")) {
      blockFlipGesture(e);
    }
  }

  function handleClick(e: MouseEvent<HTMLDivElement>) {
    const anchor = (e.target as HTMLElement).closest("a");
    if (!anchor?.href) return;

    e.preventDefault();
    e.stopPropagation();

    const url = anchor.href;
    const isExternal =
      anchor.target === "_blank" ||
      !url.startsWith(window.location.origin);

    if (isExternal) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    const path = url.slice(window.location.origin.length);
    router.push(path);
  }

  return (
    <div
      className={className}
      onPointerDown={blockLinkGesture}
      onTouchStart={blockLinkGesture}
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
