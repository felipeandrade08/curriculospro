"use client";
import { useEffect, useRef, useState } from "react";
import { formatAccessUntil, formatBRL, type CheckoutPix } from "@/lib/billing";
import { metaTrack } from "@/lib/meta-pixel";
import { trackUsage } from "@/lib/analytics";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

type View = "loading" | "approved" | "pending" | "failed" | "signin" | "missing";

/** Volta do Mercado Pago depois de pagar com cartão. */
export default function PaymentReturnPage() {
  const [view, setView] = useState<View>("loading");
  const [checkout, setCheckout] = useState<CheckoutPix | null>(null);
  const [back, setBack] = useState("/curriculos");
  const fired = useRef(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("curriculospro.returnTo");
      if (saved && saved.startsWith("/")) setBack(saved);
    } catch {}
    const params = new URLSearchParams(location.search);
    const id = params.get("payment_id") || params.get("collection_id");
    if (!id || !/^\d+$/.test(id)) {
      setView(params.get("status") === "null" || params.get("collection_status") === "null" ? "failed" : "missing");
      return;
    }
    let tries = 0,
      timer = 0;
    const check = async () => {
      tries++;
      try {
        const response = await fetch("/api/checkout/cartao?payment_id=" + id, { cache: "no-store" });
        if (response.status === 401) return setView("signin");
        const data = await response.json().catch(() => ({}));
        const c = data.checkout as CheckoutPix | undefined;
        if (c) {
          setCheckout(c);
          if (c.status === "approved") {
            setView("approved");
            if (!fired.current) {
              fired.current = true;
              trackUsage("payment_approved");
              metaTrack("Purchase", { value: c.amountCents / 100, currency: "BRL" }, "pix-" + c.paymentId);
            }
            return;
          }
          if (c.status === "rejected" || c.status === "cancelled" || c.status === "expired") return setView("failed");
          setView("pending");
        }
      } catch {}
      if (tries < 40) timer = window.setTimeout(check, tries < 10 ? 3000 : 10000);
      else setView((v) => (v === "loading" ? "pending" : v));
    };
    void check();
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="pay">
      <SiteHeader />
      <section className="pay-card shell">
        {view === "loading" && (
          <>
            <div className="pay-ic wait" aria-hidden>
              …
            </div>
            <h1>Confirmando seu pagamento</h1>
            <p>Isso leva só alguns segundos.</p>
          </>
        )}
        {view === "approved" && checkout && (
          <>
            <div className="pay-ic ok" aria-hidden>
              ✓
            </div>
            <h1>Pagamento aprovado!</h1>
            <p>
              Recebemos {formatBRL(checkout.amountCents)}.{" "}
              {checkout.accessUntil ? (
                <>
                  Seus downloads estão liberados até <b>{formatAccessUntil(checkout.accessUntil)}</b>.
                </>
              ) : (
                "Seus downloads estão liberados."
              )}
            </p>
            <a className="btn btn-primary btn-lg" href={back}>
              Voltar e baixar meu currículo
            </a>
          </>
        )}
        {view === "pending" && (
          <>
            <div className="pay-ic wait" aria-hidden>
              ⏱
            </div>
            <h1>Pagamento em análise</h1>
            <p>
              O Mercado Pago está confirmando seu pagamento. Assim que for aprovado, o download é liberado
              automaticamente e você recebe um e-mail. Pode fechar esta página.
            </p>
            <a className="btn btn-ghost" href={back}>
              Voltar ao site
            </a>
          </>
        )}
        {view === "failed" && (
          <>
            <div className="pay-ic bad" aria-hidden>
              !
            </div>
            <h1>O pagamento não foi concluído</h1>
            <p>
              Nenhuma cobrança foi feita. Você pode tentar outro cartão ou pagar com Pix, que é aprovado na
              hora.
            </p>
            <a className="btn btn-primary" href={back}>
              Tentar de novo
            </a>
          </>
        )}
        {view === "signin" && (
          <>
            <h1>Entre na sua conta</h1>
            <p>Entre com a mesma conta usada no pagamento para ver a confirmação.</p>
            <a
              className="btn btn-primary"
              href={"/auth/sign-in?callbackURL=" + encodeURIComponent(location.pathname + location.search)}
            >
              Entrar
            </a>
          </>
        )}
        {view === "missing" && (
          <>
            <h1>Não encontramos o pagamento</h1>
            <p>Se você pagou, o acesso é liberado automaticamente em alguns minutos.</p>
            <a className="btn btn-ghost" href="/curriculos">
              Ir para Meus currículos
            </a>
          </>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
