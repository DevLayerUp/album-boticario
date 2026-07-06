import type { Metadata } from "next";
import { UsuariosClient } from "./usuarios-client";

export const metadata: Metadata = { title: "Usuários" };
export const dynamic = "force-dynamic";

export default function UsuariosPage() {
  return <UsuariosClient />;
}
