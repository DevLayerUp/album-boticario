import type { Metadata } from "next";
import { MissoesClient } from "./missoes-client";

export const metadata: Metadata = { title: "Missões" };

export default function MissoesPage() {
  return <MissoesClient />;
}
