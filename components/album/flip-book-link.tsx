"use client";

import { useRouter } from "next/navigation";
import {
  useRef,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type TouchEvent,
} from "react";
import { cn } from "@/lib/utils";

function blockFlipGesture(
  e: PointerEvent<HTMLElement> | TouchEvent<HTMLElement> | MouseEvent<HTMLElement>,
) {
  e.stopPropagation();
  if ("nativeEvent" in e) {
    e.nativeEvent.stopImmediatePropagation?.();
  }
}

interface FlipBookLinkProps {
  href: string;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}

/** Link/tap seguro dentro do react-pageflip — não dispara virada de página no mobile. */
export function FlipBookLink({
  href,
  className,
  ariaLabel,
  children,
}: FlipBookLinkProps) {
  const router = useRouter();
  const touchedRef = useRef(false);
  const isExternal = /^https?:\/\//i.test(href);

  function navigate() {
    if (isExternal) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    router.push(href);
  }

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    if (touchedRef.current) {
      touchedRef.current = false;
      return;
    }
    e.preventDefault();
    blockFlipGesture(e);
    navigate();
  }

  function handleTouchStart(e: TouchEvent<HTMLAnchorElement>) {
    touchedRef.current = true;
    blockFlipGesture(e);
  }

  function handleTouchEnd(e: TouchEvent<HTMLAnchorElement>) {
    e.preventDefault();
    blockFlipGesture(e);
    navigate();
    window.setTimeout(() => {
      touchedRef.current = false;
    }, 400);
  }

  return (
    <a
      href={href}
      aria-label={ariaLabel}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={cn("relative z-30 touch-manipulation [touch-action:manipulation]", className)}
      onMouseDown={blockFlipGesture}
      onMouseDownCapture={blockFlipGesture}
      onPointerDown={blockFlipGesture}
      onPointerDownCapture={blockFlipGesture}
      onTouchStart={handleTouchStart}
      onTouchStartCapture={blockFlipGesture}
      onTouchEnd={handleTouchEnd}
      onTouchEndCapture={blockFlipGesture}
      onClick={handleClick}
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
  const touchedRef = useRef(false);

  function blockLinkGesture(
    e: PointerEvent<HTMLDivElement> | TouchEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>,
  ) {
    if ((e.target as HTMLElement).closest("a")) {
      blockFlipGesture(e);
    }
  }

  function activateAnchor(anchor: HTMLAnchorElement) {
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

  function handleClick(e: MouseEvent<HTMLDivElement>) {
    if (touchedRef.current) {
      touchedRef.current = false;
      return;
    }

    const anchor = (e.target as HTMLElement).closest("a");
    if (!anchor?.href) return;

    e.preventDefault();
    blockFlipGesture(e);
    activateAnchor(anchor);
  }

  function handleTouchEnd(e: TouchEvent<HTMLDivElement>) {
    const anchor = (e.target as HTMLElement).closest("a");
    if (!anchor?.href) return;

    e.preventDefault();
    blockFlipGesture(e);
    touchedRef.current = true;
    activateAnchor(anchor);
    window.setTimeout(() => {
      touchedRef.current = false;
    }, 400);
  }

  return (
    <div
      className={cn("relative z-30 [touch-action:manipulation]", className)}
      onMouseDown={blockLinkGesture}
      onMouseDownCapture={blockLinkGesture}
      onPointerDown={blockLinkGesture}
      onPointerDownCapture={blockLinkGesture}
      onTouchStart={blockLinkGesture}
      onTouchStartCapture={blockLinkGesture}
      onTouchEnd={handleTouchEnd}
      onTouchEndCapture={blockLinkGesture}
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
