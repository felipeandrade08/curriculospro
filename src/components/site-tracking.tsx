"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { captureReferral } from "@/lib/referral";
import { trackUsage } from "@/lib/analytics";
import { CONSENT_KEY, META_PIXEL_ID, consentGiven, loadMetaPixel, metaTrack } from "@/lib/meta-pixel";

/** Indicação (?ref=), aviso de cookies e Meta Pixel. */
export function SiteTracking() {
  const pathname = usePathname();
  const [ask, setAsk] = useState(false);

  useEffect(() => {
    if (captureReferral()) trackUsage("referral_visit");
    if (!META_PIXEL_ID) return;
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(CONSENT_KEY);
    } catch {}
    if (stored === "granted") loadMetaPixel();
    else if (!stored) setAsk(true);
  }, []);

  useEffect(() => {
    if (consentGiven()) metaTrack("PageView");
  }, [pathname]);

  const decide = (granted: boolean) => {
    try {
      localStorage.setItem(CONSENT_KEY, granted ? "granted" : "denied");
    } catch {}
    setAsk(false);
    if (granted) {
      loadMetaPixel();
      metaTrack("PageView");
    }
  };

  // O editor e a página de pagamento já são cheios de botões: o aviso aparece só fora deles.
  if (!ask || pathname?.startsWith("/admin")) return null;
  return (
    <div className="ck" role="region" aria-label="Aviso de cookies">
      <p>
        Usamos cookies de medição para saber quais anúncios trazem pessoas ao site.{" "}
        <Link href="/privacidade">Saiba mais</Link>
      </p>
      <div>
        <button type="button" className="ck-no" onClick={() => decide(false)}>
          Recusar
        </button>
        <button type="button" className="ck-yes" onClick={() => decide(true)}>
          Aceitar
        </button>
      </div>
    </div>
  );
}
