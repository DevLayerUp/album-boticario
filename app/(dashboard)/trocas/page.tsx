import type { Metadata } from "next";
import { buildAppPageMetadata } from "@/lib/seo-metadata";
import TrocasClient from "@/components/trocas/trocas-client";

export async function generateMetadata(): Promise<Metadata> {
  return buildAppPageMetadata("trocas");
}

export default function TrocasPage() {
  return <TrocasClient />;
}
