"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  label: string;
}

export function NavItem({ href, label }: NavItemProps) {
  const pathname = usePathname();
  const isActive =
    href === "/dashboard"
      ? pathname === href
      : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-200",
        isActive
          ? "bg-gb-green text-white"
          : "text-gb-slate hover:bg-gb-green/10 hover:text-gb-green-dark",
      )}
    >
      {label}
    </Link>
  );
}
