"use client";
import { WhatsappLogo } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChargeDeliver } from "./charge-deliver";
import { MarkPaid } from "./mark-paid";

type Charge = {
  id: string;
  status: "pending" | "approved" | "expired" | "cancelled" | "rejected";
  qrCode: string | null;
  qrCodeBase64: string | null;
  ticketUrl: string | null;
  payUrl?: string | null;
  amountCents: number;
  description: string;
  expiresAt: string;
};

const KINDS = [
  { id: "semana", label: "Pacote Currículo (7 dias)", price: "7,90", hint: "Libera o download na conta do cliente." },
  { id: "mes", label: "Kit Emprego (30 dias)", price: "19,90", hint: "Libera o Kit na conta do cliente." },
  { id: "servico", label: "Fazemos para você", price: "9,90", hint: "Equipe faz o currículo + 7 dias de ajustes." },
  { id: "avulso", label: "Outro valor", price: "", hint: "Qualquer cobrança avulsa." },
] as const;

const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Gera Pix para o cliente pagar pelo WhatsApp e acompanha o pagamento. */
export function PixCharge({ cloud }: { cloud: { id: string; title: string; updated: string }[] }) {
  const router = useRouter();
  const [kind, setKind] = useState<(typeof KINDS)[number]["id"]>("servico");
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [charge, setCharge] = useState<Charge | null>(null);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const current = KINDS.find((k) => k.id === kind)!;
  const [accountCharge, setAccountCharge] = useState(false);
  const needsAccount = charge ? accountCharge : kind === "semana" || kind === "mes";
  const [renewing, setRenewing] = useState(false);

  /** Mostra aqui um Pix gerado de novo (pelo botão desta tela ou da lista). */
  const showRenewed = (d: Charge & { name?: string; phone?: string; email?: string; needsAccount?: boolean }) => {
    setCharge(d);
    setName(d.name || "");
    setPhone(d.phone || "");
    setEmail(d.email || "");
    setAccountCharge(!!d.needsAccount);
    setCopied(false);
    setLinkCopied(false);
    setError("");
  };
  useEffect(() => {
    const onRenewed = (e: Event) => {
      showRenewed((e as CustomEvent).detail);
      document.querySelector(".cpa-pix-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener("cpa-pix-renewed", onRenewed);
    return () => window.removeEventListener("cpa-pix-renewed", onRenewed);
  }, []);
  const renew = async () => {
    if (!charge) return;
    setRenewing(true);
    setError("");
    try {
      const r = await fetch("/api/admin/pix/renovar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: charge.id }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.message || "Não foi possível gerar o novo Pix.");
      showRenewed(d);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível gerar o novo Pix.");
    } finally {
      setRenewing(false);
    }
  };

  useEffect(() => {
    if (current.price) setAmount(current.price);
  }, [current.price]);

  // Confere o pagamento a cada 5 s enquanto o Pix estiver aguardando.
  useEffect(() => {
    if (!charge || charge.status !== "pending") return;
    const timer = window.setInterval(async () => {
      const r = await fetch("/api/admin/pix?id=" + charge.id, { cache: "no-store" }).catch(() => null);
      const d = (await r?.json().catch(() => null)) as { status?: Charge["status"] } | null;
      if (d?.status && d.status !== "pending") {
        setCharge({ ...charge, status: d.status });
        router.refresh();
      }
    }, 5000);
    return () => window.clearInterval(timer);
  }, [charge, router]);

  const create = async () => {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/admin/pix", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, amount, email, name, phone, description }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.message || "Não foi possível gerar o Pix.");
      setCharge(d as Charge);
      setAccountCharge(kind === "semana" || kind === "mes");
      setCopied(false);
      setLinkCopied(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível gerar o Pix.");
    } finally {
      setBusy(false);
    }
  };

  const digits = phone.replace(/\D/g, "");
  const waNumber = digits.length >= 10 && digits.length <= 11 ? "55" + digits : digits.startsWith("55") ? digits : "";
  const message = charge
    ? [
        `Olá${name ? ", " + name.split(" ")[0] : ""}! Segue o pagamento do CurriculosPRO:`,
        `*${charge.description}* — *${brl(charge.amountCents)}*`,
        "",
        ...(charge.payUrl
          ? [
              "Toque no link, aperte *Copiar código Pix* e cole no app do seu banco, em Pix > Pix Copia e Cola:",
              charge.payUrl,
              "",
              "A página mostra a confirmação sozinha assim que o pagamento cair. 😊",
            ]
          : [
              "Copie o código abaixo e cole no app do seu banco, em Pix > Pix Copia e Cola:",
              "",
              charge.qrCode || "",
              "",
              "Assim que pagar, me avise por aqui. 😊",
            ]),
      ].join("\n")
    : "";
  const waLink = (waNumber ? "https://wa.me/" + waNumber : "https://wa.me/") + "?text=" + encodeURIComponent(message);

  if (charge)
    return (
      <div className="cpa-pix-result cpa-pix-anchor">
        <div className={"cpa-pix-status " + charge.status}>
          {charge.status === "approved"
            ? "✓ Pago! O pagamento foi confirmado."
            : charge.status === "pending"
              ? "Aguardando pagamento… (confere sozinho a cada 5 segundos)"
              : charge.status === "expired"
                ? "Este Pix venceu."
                : "Pagamento não concluído."}
          {charge.status !== "approved" && (
            <MarkPaid id={charge.id} onDone={() => setCharge({ ...charge, status: "approved" })} />
          )}
          {(charge.status === "expired" || charge.status === "cancelled" || charge.status === "rejected") && (
            <button type="button" className="cpa-btn small" onClick={renew} disabled={renewing}>
              {renewing ? "Gerando…" : "Gerar novo Pix (mesma cobrança)"}
            </button>
          )}
        </div>
        {error && (
          <p className="cpa-pix-error" role="alert">
            {error}
          </p>
        )}
        <div className="cpa-pix-body">
          {charge.qrCodeBase64 && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={"data:image/png;base64," + charge.qrCodeBase64} alt="QR Code do Pix" width={200} height={200} />
          )}
          <div>
            <b>
              {charge.description} · {brl(charge.amountCents)}
            </b>
            <small>
              Vale até{" "}
              {new Date(charge.expiresAt).toLocaleString("pt-BR", {
                timeZone: "America/Sao_Paulo",
                dateStyle: "short",
                timeStyle: "short",
              })}
              {needsAccount ? " · libera o pacote na conta quando for pago" : ""}
            </small>
            <textarea readOnly value={charge.qrCode || ""} rows={4} onFocus={(e) => e.currentTarget.select()} />
            <div className="cpa-pix-actions">
              <button
                type="button"
                className="cpa-btn"
                onClick={() => {
                  void navigator.clipboard?.writeText(charge.qrCode || "");
                  setCopied(true);
                }}
              >
                {copied ? "Copiado ✓" : "Copiar código Pix"}
              </button>
              <a className="cpa-btn wa" href={waLink} target="_blank" rel="noreferrer">
                <WhatsappLogo size={18} weight="fill" aria-hidden="true" /> Enviar no WhatsApp
              </a>
              {charge.payUrl && (
                <button
                  type="button"
                  className="cpa-btn ghost"
                  onClick={() => {
                    void navigator.clipboard?.writeText(charge.payUrl || "");
                    setLinkCopied(true);
                  }}
                >
                  {linkCopied ? "Link copiado ✓" : "Copiar link de pagamento"}
                </button>
              )}
              <button type="button" className="cpa-btn ghost" onClick={() => setCharge(null)}>
                Nova cobrança
              </button>
            </div>
            <small className="cpa-muted">
              A mensagem leva um link com o botão “Copiar código Pix” e a confirmação automática. Se o cliente
              ainda assim pagar pela chave Pix, use “Recebi pela chave Pix” para dar baixa.
            </small>
          </div>
        </div>
        {charge.status === "approved" && (
          <div className="cpa-pix-deliver">
            <h3>Entregar o currículo</h3>
            <small className="cpa-muted">
              Escolha o currículo que você montou para o cliente. Geramos o link para ele baixar em PDF e Word
              {email ? " e mandamos por e-mail" : ""}.
            </small>
            <ChargeDeliver paymentId={charge.id} name={name} phone={phone} cloud={cloud} inAccount={needsAccount} open />
          </div>
        )}
      </div>
    );

  return (
    <div className="cpa-pix-form cpa-pix-anchor">
      <fieldset>
        <legend>O que você está vendendo?</legend>
        <div className="cpa-pix-kinds">
          {KINDS.map((k) => (
            <label key={k.id} className={kind === k.id ? "on" : ""}>
              <input type="radio" name="kind" checked={kind === k.id} onChange={() => setKind(k.id)} />
              <b>{k.label}</b>
              <small>{k.price ? "R$ " + k.price + " · " : ""}{k.hint}</small>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="cpa-pix-grid">
        <label>
          Valor (R$)
          <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Ex.: 39,90" />
        </label>
        <label>
          Nome do cliente
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Maria Souza" />
        </label>
        <label>
          WhatsApp do cliente
          <input inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 98888-7777" />
        </label>
        <label>
          E-mail {needsAccount ? "da conta do cliente" : "(opcional)"}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="cliente@email.com"
            required={needsAccount}
          />
        </label>
        <label className="wide">
          Descrição (aparece no comprovante)
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={needsAccount ? "Opcional" : "Ex.: Currículo + carta de apresentação"}
          />
        </label>
      </div>
      {error && (
        <p className="cpa-pix-error" role="alert">
          {error}
        </p>
      )}
      <button type="button" className="cpa-btn" onClick={create} disabled={busy || !amount}>
        {busy ? "Gerando Pix…" : "Gerar Pix"}
      </button>
    </div>
  );
}
