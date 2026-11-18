"use client";
import { storedOrigin } from "@/lib/origin";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ACCESS_LIST_PRICE_CENTS,
  ACCESS_PLANS,
  PROMO_PERCENT,
  KIT_NAME,
  PLAN_FEATURES,
  REFERRED_BONUS_DAYS,
  formatAccessUntil,
  formatBRL,
  type AccessPlanId,
  type CheckoutPix,
  type CouponQuote,
} from "@/lib/billing";
import { storedCoupon, storedReferral } from "@/lib/referral";
import { consentGiven, metaTrack } from "@/lib/meta-pixel";
import { isTeamBrowser } from "@/lib/team";
import type { AccessInfo } from "@/lib/use-access";
import { trackUsage } from "@/lib/analytics";

type Stage = "offer" | "creating" | "pix" | "approved" | "expired" | "error";

const POLL_MS = 4000;

export function CheckoutModal({
  open,
  access,
  returnTo,
  onClose,
  onUnlocked,
  onDownload,
  mode = "download",
}: {
  open: boolean;
  access: AccessInfo;
  /** Página para voltar depois de entrar ou criar a conta. */
  returnTo: string;
  onClose: () => void;
  onUnlocked: (accessUntil: string | null) => void;
  onDownload?: () => void;
  /** "kit": aberto por uma ferramenta do Kit Emprego (oferece o Kit ou o upgrade). "servico": Fazemos para você. */
  mode?: "download" | "kit" | "servico";
}) {
  const [stage, setStage] = useState<Stage>("offer");
  const [checkout, setCheckout] = useState<CheckoutPix | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  /** Diferença entre o relógio do servidor e o do aparelho (relógio errado no PC não pode "vencer" o Pix). */
  const skew = useRef(0);
  const [endReason, setEndReason] = useState<"expired" | "cancelled">("expired");
  const syncClock = (response: Response) => {
    const header = response.headers.get("date");
    const server = header ? new Date(header).getTime() : NaN;
    if (Number.isFinite(server)) {
      const diff = server - Date.now();
      skew.current = Math.abs(diff) > 60_000 ? diff : 0;
    }
  };
  const dialog = useRef<HTMLElement>(null);
  const unlockedRef = useRef(false);
  const [hasRef, setHasRef] = useState(false);
  const [plan, setPlan] = useState<AccessPlanId>("semana");
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [quote, setQuote] = useState<CouponQuote | null>(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [cardLoading, setCardLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    unlockedRef.current = false;
    const upgrade = mode === "kit" && access.active && !access.kit;
    const needsPurchase = mode === "servico" ? !access.service : !access.active || upgrade || (mode === "kit" && !access.kit);
    setStage(needsPurchase ? "offer" : "approved");
    setPlan(upgrade ? "upgrade" : mode === "kit" ? "mes" : mode === "servico" ? "servico" : "semana");
    setQuote(null);
    setCouponMsg("");
    setHasRef(!!storedReferral());
    setError("");
    const saved = storedCoupon();
    if (saved) {
      setCouponOpen(true);
      setCouponCode(saved);
      if (!(mode === "kit" && access.active))
        void checkCoupon(saved, mode === "kit" ? "mes" : mode === "servico" ? "servico" : "semana");
    }
    trackUsage("paywall_view");
    dialog.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const applyCheckout = useCallback(
    (next: CheckoutPix) => {
      setCheckout(next);
      if (next.status === "approved") {
        setStage("approved");
        if (!unlockedRef.current) {
          unlockedRef.current = true;
          trackUsage("payment_approved");
          metaTrack("Purchase", { value: next.amountCents / 100, currency: "BRL" }, "pix-" + next.paymentId);
          onUnlocked(next.accessUntil ?? null);
        }
      } else if (next.status === "pending") setStage("pix");
      else if (next.status === "expired" || next.status === "cancelled") {
        setEndReason(next.status === "cancelled" ? "cancelled" : "expired");
        setStage("expired");
      }
      else {
        setError("O pagamento não foi aprovado. Gere um novo código Pix e tente novamente.");
        setStage("error");
      }
    },
    [onUnlocked],
  );

  async function checkCoupon(code: string, forPlan: AccessPlanId) {
    const clean = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    setQuote(null);
    setCouponMsg("");
    if (clean.length < 3) return;
    setCheckingCoupon(true);
    try {
      const response = await fetch(
        "/api/checkout/cupom?plan=" + forPlan + "&code=" + encodeURIComponent(clean),
        { cache: "no-store" },
      );
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.quote) setQuote(data.quote as CouponQuote);
      else setCouponMsg(data.message || "Cupom inválido.");
    } catch {
      setCouponMsg("Não foi possível conferir o cupom agora.");
    } finally {
      setCheckingCoupon(false);
    }
  }

  const choosePlan = (next: AccessPlanId) => {
    setPlan(next);
    if (couponCode.trim()) void checkCoupon(couponCode, next);
  };

  const payload = () =>
    JSON.stringify({
      plan,
      coupon: quote && quote.plan === plan ? quote.code : "",
      origin: storedOrigin(),
      consent: consentGiven() && !isTeamBrowser(),
    });

  const payCard = async () => {
    setCardLoading(true);
    setError("");
    trackUsage("checkout_started");
    try {
      const response = await fetch("/api/checkout/cartao", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: payload(),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) throw new Error("Sua sessão expirou. Entre novamente para continuar.");
      if (!response.ok || !data.url) throw new Error(data.message || "Não foi possível abrir o pagamento com cartão.");
      try {
        sessionStorage.setItem("curriculospro.returnTo", returnTo);
      } catch {}
      location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível abrir o pagamento com cartão.");
      setCardLoading(false);
    }
  };

  const createPix = async () => {
    setStage("creating");
    setError("");
    trackUsage("checkout_started");
    try {
      const response = await fetch("/api/checkout/pix", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: payload(),
      });
      syncClock(response);
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        setStage("offer");
        setError("Sua sessão expirou. Entre novamente para continuar.");
        return;
      }
      if (!response.ok || !data.checkout)
        throw new Error(data.message || "Não foi possível gerar o Pix agora.");
      applyCheckout(data.checkout as CheckoutPix);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível gerar o Pix agora.");
      setStage("error");
    }
  };

  // Consulta periódica enquanto o Pix está aberto, e ao voltar para a aba (ex.: depois de pagar no app do banco).
  useEffect(() => {
    if (!open || stage !== "pix" || !checkout) return;
    let active = true;
    const check = async () => {
      try {
        const response = await fetch("/api/checkout/pix/" + checkout.paymentId, { cache: "no-store" });
        syncClock(response);
        if (!response.ok) return;
        const data = await response.json();
        if (active && data.checkout) applyCheckout(data.checkout as CheckoutPix);
      } catch {}
    };
    const timer = window.setInterval(check, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void check();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [open, stage, checkout, applyCheckout]);

  useEffect(() => {
    if (!open || stage !== "pix") return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [open, stage]);

  const remaining = checkout?.expiresAt
    ? Math.max(0, new Date(checkout.expiresAt).getTime() - (now + skew.current))
    : 0;
  useEffect(() => {
    if (stage === "pix" && checkout?.expiresAt && remaining === 0) {
      setEndReason("expired");
      setStage("expired");
    }
  }, [stage, checkout, remaining]);

  const copyCode = async () => {
    if (!checkout?.qrCode) return;
    try {
      await navigator.clipboard.writeText(checkout.qrCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  if (!open) return null;
  const signInHref = "/auth/sign-in?callbackURL=" + encodeURIComponent(returnTo);
  const signUpHref = "/auth/sign-up?callbackURL=" + encodeURIComponent(returnTo);
  const minutes = Math.floor(remaining / 60000),
    seconds = Math.floor((remaining % 60000) / 1000);
  const accessUntil = checkout?.accessUntil || access.accessUntil;
  const upgradeMode = plan === "upgrade";
  const chosen = ACCESS_PLANS[plan];
  const finalCents = quote && quote.plan === plan ? quote.finalCents : chosen.cents;
  const priceLabel = formatBRL(finalCents);

  return (
    <div
      className="checkoutBackdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialog}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkoutTitle"
        className={"checkoutDialog stage-" + stage}
      >
        <button className="checkoutClose" type="button" aria-label="Fechar" onClick={onClose}>
          ×
        </button>

        {(stage === "offer" || stage === "creating") && (
          <>
            {upgradeMode ? (
              <>
                <span className="checkoutEyebrow">{KIT_NAME.toUpperCase()}</span>
                <h2 id="checkoutTitle">Complete seu acesso com o {KIT_NAME}.</h2>
                <p className="checkoutLead">
                  Você já tem o pacote Currículo. Pague só a diferença e libere todas as ferramentas para
                  conseguir a vaga, com acesso completando 30 dias.
                </p>
                <div className="checkoutUpgrade">
                  <div>
                    <strong>{formatBRL(ACCESS_PLANS.upgrade.cents)}</strong>
                    <span>a diferença para o {KIT_NAME} · +23 dias de acesso</span>
                  </div>
                </div>
              </>
            ) : mode === "servico" ? (
              <>
                <span className="checkoutEyebrow">FAZEMOS PARA VOCÊ</span>
                <h2 id="checkoutTitle">Nossa equipe monta seu currículo.</h2>
                <div className="checkoutUpgrade">
                  <div>
                    <strong>{formatBRL(ACCESS_PLANS.servico.cents)}</strong>
                    <span>currículo pronto em até 24 horas · pagamento único</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <span className="checkoutEyebrow">{mode === "kit" ? KIT_NAME.toUpperCase() : "ESCOLHA SEU PACOTE"}</span>
                <h2 id="checkoutTitle">
                  {mode === "kit" ? "Tudo o que você precisa para conseguir a vaga." : "Seu currículo está pronto para sair do papel."}
                </h2>
                <div className="checkoutPlans" role="radiogroup" aria-label="Escolha o pacote">
                  {(["semana", "mes"] as const).map((id) => {
                    const p = ACCESS_PLANS[id];
                    return (
                      <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={plan === id}
                        className={"checkoutPlan" + (plan === id ? " on" : "")}
                        onClick={() => choosePlan(id)}
                      >
                        <span className="cpName">{p.title}</span>
                        {id === "semana" && ACCESS_LIST_PRICE_CENTS > p.cents && (
                          <s className="cpList">{formatBRL(ACCESS_LIST_PRICE_CENTS)}</s>
                        )}
                        <strong>{formatBRL(p.cents)}</strong>
                        <small>{p.name} de acesso · pagamento único</small>
                        {id === "mes" && <em>Mais completo</em>}
                        {id === "semana" && ACCESS_LIST_PRICE_CENTS > p.cents && (
                          <em className="cpPromo">{PROMO_PERCENT}% OFF</em>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            {!upgradeMode && (
            <div className="checkoutCoupon">
              {!couponOpen ? (
                <button type="button" className="linkish" onClick={() => setCouponOpen(true)}>
                  Tenho um cupom de desconto
                </button>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void checkCoupon(couponCode, plan);
                  }}
                >
                  <input
                    aria-label="Cupom de desconto"
                    placeholder="Cupom"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setQuote(null);
                      setCouponMsg("");
                    }}
                    autoCapitalize="characters"
                    maxLength={20}
                  />
                  <button type="submit" disabled={checkingCoupon || couponCode.trim().length < 3}>
                    {checkingCoupon ? "Conferindo…" : "Aplicar"}
                  </button>
                </form>
              )}
              {quote && quote.plan === plan && (
                <p className="couponOk">
                  Cupom {quote.code}: {quote.label}. De <s>{formatBRL(quote.originalCents)}</s> por{" "}
                  <b>{formatBRL(quote.finalCents)}</b>.
                </p>
              )}
              {couponMsg && <p className="couponBad">{couponMsg}</p>}
            </div>
            )}
            {(access.referralBonus || (!access.signedIn && !access.loading && hasRef)) && (
              <p className="checkoutBonus">
                🎁 Você chegou por indicação: ganha <b>+{REFERRED_BONUS_DAYS} dias</b> extras nesta compra (
                {chosen.days + REFERRED_BONUS_DAYS} dias no total).
              </p>
            )}
            <ul className="checkoutBenefits">
              {(plan === "semana"
                ? PLAN_FEATURES.semana
                : plan === "servico"
                  ? PLAN_FEATURES.servico
                  : PLAN_FEATURES.mes.slice(plan === "upgrade" ? 1 : 0)
              ).map((f) => (
                <li key={f}>{f}</li>
              ))}
              <li>Sem assinatura e sem renovação automática</li>
            </ul>
            {error && (
              <div className="checkoutError" role="alert">
                {error}
              </div>
            )}
            {access.loading ? (
              <button className="checkoutPrimary" type="button" disabled>
                Carregando…
              </button>
            ) : access.signedIn ? (
              <>
                <button
                  className="checkoutPrimary"
                  type="button"
                  onClick={createPix}
                  disabled={stage === "creating" || cardLoading}
                >
                  {stage === "creating" ? "Gerando seu Pix…" : "Pagar " + priceLabel + " com Pix"}
                </button>
                <button
                  className="checkoutSecondary"
                  type="button"
                  onClick={payCard}
                  disabled={stage === "creating" || cardLoading}
                >
                  {cardLoading ? "Abrindo pagamento…" : "Pagar com cartão de crédito ou débito"}
                </button>
                <small className="checkoutAccount">Acesso vinculado a {access.email}</small>
              </>
            ) : (
              <>
                <Link className="checkoutPrimary" href={signUpHref}>
                  Criar conta e continuar
                </Link>
                <p className="checkoutSignIn">
                  Já tem conta? <Link href={signInHref}>Entrar</Link>
                </p>
                <small className="checkoutAccount">
                  A conta guarda seu acesso e sincroniza seus currículos. Nada do que você escreveu será
                  perdido.
                </small>
              </>
            )}
            <p className="checkoutTrust">
              <span aria-hidden="true">🔒</span> Pagamento processado pelo Mercado Pago
            </p>
          </>
        )}

        {stage === "pix" && checkout && (
          <>
            <span className="checkoutEyebrow">PAGUE COM PIX</span>
            <h2 id="checkoutTitle">Escaneie o QR Code no app do seu banco</h2>
            <div className="pixBox">
              {checkout.qrCodeBase64 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="pixQr"
                  src={"data:image/png;base64," + checkout.qrCodeBase64}
                  alt="QR Code Pix para pagamento"
                  width={220}
                  height={220}
                />
              ) : (
                <div className="pixQr pixQrMissing">QR Code indisponível. Use o código abaixo.</div>
              )}
              <div className="pixSide">
                <div className="pixAmount">
                  <span>Valor</span>
                  <strong>{formatBRL(checkout.amountCents)}</strong>
                </div>
                <div className="pixTimer" aria-live="off">
                  <span>Expira em</span>
                  <strong>
                    {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                  </strong>
                </div>
                <div className="pixWaiting" role="status">
                  <i aria-hidden="true" /> Aguardando pagamento…
                </div>
              </div>
            </div>
            {checkout.qrCode && (
              <div className="pixCopy">
                <label htmlFor="pixCode">Ou use o Pix copia e cola</label>
                <div>
                  <input
                    id="pixCode"
                    readOnly
                    value={checkout.qrCode}
                    onFocus={(e) => e.currentTarget.select()}
                  />
                  <button type="button" onClick={copyCode}>
                    {copied ? "Copiado ✓" : "Copiar código"}
                  </button>
                </div>
              </div>
            )}
            <ol className="pixSteps">
              <li>Abra o app do seu banco e escolha pagar com Pix.</li>
              <li>Escaneie o QR Code ou cole o código copiado.</li>
              <li>Confirme. O download é liberado aqui automaticamente.</li>
            </ol>
            <p className="checkoutTrust">
              <span aria-hidden="true">🔒</span> Pagamento processado pelo Mercado Pago · Pode fechar esta
              janela; o acesso é liberado assim que o pagamento for confirmado.
            </p>
          </>
        )}

        {stage === "approved" && (
          <div className="checkoutSuccess">
            <div className="checkoutCheck" aria-hidden="true">
              ✓
            </div>
            <h2 id="checkoutTitle">
              {mode === "kit" ? KIT_NAME + " liberado!" : mode === "servico" ? "Pagamento confirmado!" : "Download liberado!"}
            </h2>
            <p>
              {mode === "servico" ? (
                <>
                  Agora é só preencher o pedido com suas informações. Entregamos seu currículo em até 24 horas.
                </>
              ) : accessUntil ? (
                <>
                  Seu acesso vale até <b>{formatAccessUntil(accessUntil)}</b>. Baixe e ajuste seus currículos
                  quantas vezes quiser até lá.
                </>
              ) : (
                <>Seu acesso está ativo. Baixe e ajuste seus currículos quantas vezes quiser.</>
              )}
            </p>
            {onDownload ? (
              <button
                className="checkoutPrimary"
                type="button"
                onClick={() => {
                  onClose();
                  onDownload();
                }}
              >
                {mode === "servico" ? "Preencher meu pedido" : "Baixar meu PDF agora ↓"}
              </button>
            ) : (
              <button className="checkoutPrimary" type="button" onClick={onClose}>
                Continuar
              </button>
            )}
          </div>
        )}

        {stage === "expired" && (
          <div className="checkoutSuccess">
            <div className="checkoutCheck neutral" aria-hidden="true">
              ⏱
            </div>
            <h2 id="checkoutTitle">{endReason === "cancelled" ? "Este Pix foi cancelado" : "O código Pix expirou"}</h2>
            <p>
              {endReason === "cancelled"
                ? "O Mercado Pago cancelou este código antes do pagamento. Nenhuma cobrança foi feita. Gere um novo código para continuar."
                : "O código vale por 30 minutos e passou do prazo sem pagamento. Nenhuma cobrança foi feita. Gere um novo código para concluir."}
            </p>
            <button className="checkoutPrimary" type="button" onClick={createPix}>
              Gerar novo código Pix
            </button>
          </div>
        )}

        {stage === "error" && (
          <div className="checkoutSuccess">
            <div className="checkoutCheck neutral" aria-hidden="true">
              !
            </div>
            <h2 id="checkoutTitle">Não deu certo desta vez</h2>
            <p>{error || "Tente novamente em instantes."}</p>
            <button className="checkoutPrimary" type="button" onClick={createPix}>
              Tentar novamente
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
