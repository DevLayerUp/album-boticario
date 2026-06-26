import { redirect } from "next/navigation";
import { GBG_PRIVACY_URL } from "@/lib/landing-urls";

export default function PrivacidadePage() {
  redirect(GBG_PRIVACY_URL);
}
