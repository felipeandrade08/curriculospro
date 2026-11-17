"use client";
import { useCallback, useState, type ReactNode } from "react";
import { CheckoutModal } from "@/components/checkout-modal";
import { useAccess } from "@/lib/use-access";
import { KIT_NAME, KIT_PRICE_LABEL, UPGRADE_PRICE_LABEL } from "@/lib/billing";
import { trackUsage } from "@/lib/analytics";

/**
 * Controle das ferramentas do Kit Emprego numa página: diz se a pessoa tem o Kit
 * e abre o pagamento (Kit completo ou upgrade de quem já tem o Currículo).
 */
export function useKitGate(returnTo: string) {
  const { access, unlock } = useAccess();
  const [open, setOpen] = useState(false);
  const ask = useCallback(() => {
    trackUsage("kit_gate_view");
    setOpen(true);
  }, []);
  const modal = (
    <CheckoutModal
      open={open}
      access={access}
      returnTo={returnTo}
      mode="kit"
      onClose={() => setOpen(false)}
      onUnlocked={(until) => unlock(until)}
    />
  );
  const cta = access.active && !access.kit ? `Liberar por mais ${UPGRADE_PRICE_LABEL}` : `Liberar o ${KIT_NAME}`;
  return { access, kit: access.kit, loading: access.loading, ask, modal, cta };
}

/** Mostra só o começo do conteúdo, desfocado, com o convite para liberar o Kit. */
export function KitBlur({
  kit,
  loading,
  onUnlock,
  cta,
  title,
  text,
  children,
  height = 180,
}: {
  kit: boolean;
  loading: boolean;
  onUnlock: () => void;
  cta: string;
  title: string;
  text: string;
  children: ReactNode;
  height?: number;
}) {
  if (kit) return <>{children}</>;
  return (
    <div className="kg">
      <div className="kg-preview" style={{ maxHeight: height }} aria-hidden="true" inert>
        {children}
      </div>
      <div className="kg-card">
        <span className="kg-badge">{KIT_NAME}</span>
        <b>{title}</b>
        <p>{text}</p>
        <button type="button" className="btn btn-primary" onClick={onUnlock} disabled={loading}>
          {cta}
        </button>
        <small>
          {KIT_PRICE_LABEL} por 30 dias, ou só a diferença para quem já tem o pacote Currículo. Pagamento único.
        </small>
      </div>
    </div>
  );
}

/** Selo pequeno para botões que só funcionam no Kit. */
export function KitTag() {
  return <span className="kg-tag">Kit</span>;
}
