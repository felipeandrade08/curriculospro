"use client";
import { usePathname } from "next/navigation";
import { SUPPORT_WHATSAPP_URL } from "@/lib/site";
import { useTeam } from "@/components/team-flag";

const HIDDEN = ["/editor", "/carta", "/admin", "/auth"];

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
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 19.5l1.2-3.6A8 8 0 1 1 8.4 19L4 19.5z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M9 10.5h6M9 13.5h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span>Ajuda no WhatsApp</span>
    </a>
  );
}
