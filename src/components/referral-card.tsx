"use client";
import { WhatsappLogo } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { REFERRED_BONUS_DAYS, REFERRER_BONUS_DAYS } from "@/lib/billing";

type Info = { code: string; url: string; friends: number; daysEarned: number; pending: number };

export function ReferralCard() {
  const [info, setInfo] = useState<Info | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "signed-out" | "error">("loading");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    fetch("/api/account/referral", { cache: "no-store" })
      .then(async (r) => {
        if (r.status === 401) return setState("signed-out");
        if (!r.ok) return setState("error");
        setInfo(await r.json());
        setState("ready");
      })
      .catch(() => setState("error"));
  }, []);
  if (state === "error" || state === "loading") return null;
  const message = info
    ? `Fiz meu currículo no CurriculosPRO e ficou ótimo. Cria o seu de graça por aqui — no download você ganha ${REFERRED_BONUS_DAYS} dias a mais: ${info.url}`
    : "";
  const copy = async () => {
    if (!info) return;
    try {
      await navigator.clipboard.writeText(info.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <section className="rf" id="indique" aria-labelledby="rf-title">
      <div className="rf-text">
        <h2 id="rf-title">Indique e ganhe {REFERRER_BONUS_DAYS} dias de download</h2>
        <p>
          Mande seu link para quem está procurando emprego. Quando a pessoa fizer a primeira compra, você
          ganha <b>+{REFERRER_BONUS_DAYS} dias</b> e ela ganha <b>+{REFERRED_BONUS_DAYS} dias</b>. Sem limite
          de indicações.
        </p>
      </div>
      {state === "signed-out" ? (
        <Link className="btn btn-primary" href="/auth/sign-in?callbackURL=%2Fcurriculos%23indique">
          Entrar para pegar meu link
        </Link>
      ) : (
        info && (
          <div className="rf-box">
            <div className="rf-link">
              <input
                readOnly
                value={info.url}
                aria-label="Seu link de indicação"
                onFocus={(e) => e.target.select()}
              />
              <button type="button" className="btn btn-ghost" onClick={copy}>
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>
            <a
              className="btn btn-primary rf-wa"
              href={"https://wa.me/?text=" + encodeURIComponent(message)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsappLogo size={18} weight="fill" aria-hidden="true" /> Enviar pelo WhatsApp
            </a>
            <dl className="rf-stats">
              <div>
                <dt>Amigos que compraram</dt>
                <dd>{info.friends}</dd>
              </div>
              <div>
                <dt>Dias ganhos</dt>
                <dd>{info.daysEarned}</dd>
              </div>
              <div>
                <dt>Criaram conta pelo link</dt>
                <dd>{info.pending + info.friends}</dd>
              </div>
            </dl>
          </div>
        )
      )}
    </section>
  );
}
