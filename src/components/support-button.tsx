"use client";
import { WhatsappLogo } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { SUPPORT_WHATSAPP_URL } from "@/lib/site";
import { useTeam } from "@/components/team-flag";

const HIDDEN = ["/editor", "/carta", "/admin", "/auth", "/e/", "/entrega/", "/fazemos"];

/** Atendimento humano sempre à mão (fora das telas de edição, que já têm barras próprias). */
export function SupportButton() {
  const pathname = usePathname() || "";
  const team = useTeam();
  if (team || HIDDEN.some((p) => pathname.startsWith(p))) return null;
  return (
    <a
      className="wa-float"
      href={SUPPORT_WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com o suporte no WhatsApp"
    >
      <WhatsappLogo size={24} weight="fill" aria-hidden="true" />
      <span>Ajuda no WhatsApp</span>
    </a>
  );
}
