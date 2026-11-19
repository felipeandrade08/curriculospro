"use client";
import { WhatsappLogo } from "@phosphor-icons/react";
import { useEffect } from "react";
import { trackUsage } from "@/lib/analytics";
import { AD_WHATSAPP_URL } from "./whatsapp";

/** Botão que abre o WhatsApp da equipe com a mensagem já escrita e conta o clique no painel. */
export function WhatsappCta({ className, children }: { className: string; children?: React.ReactNode }) {
  return (
    <a
      className={className}
      href={AD_WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackUsage("whatsapp_click")}
    >
      <WhatsappLogo size={22} weight="fill" aria-hidden="true" />
      <span>{children || "Chamar no WhatsApp"}</span>
    </a>
  );
}

/** Conta a visita à página do anúncio (uma vez por sessão). */
export function LandingBeacon() {
  useEffect(() => trackUsage("ad_landing_view"), []);
  return null;
}
