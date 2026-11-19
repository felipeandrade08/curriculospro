"use client";
import { CheckCircle, Copy, WhatsappLogo } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import type { PayPage } from "@/lib/server/pay-page";

const WA = "https://wa.me/5516997434009?text=";
const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function PayView({ token, page }: { token: string; page: PayPage }) {
  const [status, setStatus] = useState(page.status);
  const [copied, setCopied] = useState(false);
  const box = useRef<HTMLTextAreaElement>(null);
  const price = brl(page.amountCents);

  useEffect(() => {
    if (status !== "pending") return;
    const t = setInterval(async () => {
      const r = await fetch("/api/p/" + token, { cache: "no-store" }).catch(() => null);
      const d = (await r?.json().catch(() => null)) as { status?: PayPage["status"] } | null;
      if (d?.status && d.status !== "pending") setStatus(d.status);
    }, 5000);
    return () => clearInterval(t);
  }, [status, token]);

  const copy = async () => {
    const code = page.qrCode || "";
    let ok = false;
    try {
      await navigator.clipboard.writeText(code);
      ok = true;
    } catch {
      // Navegador antigo ou dentro de outro app: seleciona e usa o comando de copiar.
      const el = box.current;
      if (el) {
        el.focus();
        el.select();
        el.setSelectionRange(0, code.length);
        try {
          ok = document.execCommand("copy");
        } catch {}
      }
    }
    setCopied(ok);
    if (!ok) box.current?.select();
  };

  if (status === "approved")
    return (
      <main className="pay">
        <Logo />
        <section className="pay-card pay-done" role="status">
          <CheckCircle size={64} weight="fill" aria-hidden="true" />
          <h1>Pagamento confirmado!</h1>
          <p>
            Recebemos {price}. {page.firstName ? page.firstName + ", a" : "A"} gente já está cuidando do seu pedido e
            manda tudo pelo WhatsApp.
          </p>
          <a className="pay-wa" href={WA + encodeURIComponent("Olá! Acabei de pagar o Pix.")} target="_blank" rel="noopener noreferrer">
            <WhatsappLogo size={22} weight="fill" aria-hidden="true" /> Voltar para o WhatsApp
          </a>
        </section>
      </main>
    );

  if (status !== "pending")
    return (
      <main className="pay">
        <Logo />
        <section className="pay-card">
          <h1>Este Pix não vale mais</h1>
          <p>O código venceu ou foi cancelado. Chame a gente que mandamos um novo na hora.</p>
          <a className="pay-wa" href={WA + encodeURIComponent("Olá! Meu Pix venceu, pode mandar outro?")} target="_blank" rel="noopener noreferrer">
            <WhatsappLogo size={22} weight="fill" aria-hidden="true" /> Pedir um Pix novo
          </a>
        </section>
      </main>
    );

  return (
    <main className="pay">
      <Logo />
      <section className="pay-card">
        <p className="pay-hello">{page.firstName ? `Olá, ${page.firstName}! ` : ""}Falta só o pagamento</p>
        <div className="pay-amount">{price}</div>
        <p className="pay-desc">{page.description}</p>

        <button type="button" className={"pay-copy" + (copied ? " ok" : "")} onClick={copy}>
          {copied ? <CheckCircle size={24} weight="fill" aria-hidden="true" /> : <Copy size={24} weight="bold" aria-hidden="true" />}
          {copied ? "Código copiado!" : "Copiar código Pix"}
        </button>
        <textarea
          ref={box}
          className="pay-code"
          readOnly
          rows={3}
          value={page.qrCode || ""}
          aria-label="Código Pix copia e cola"
          onFocus={(e) => e.currentTarget.select()}
        />

        <ol className="pay-steps">
          <li>Abra o aplicativo do seu banco.</li>
          <li>
            Entre em <b>Pix</b> e escolha <b>Pix Copia e Cola</b> (em alguns bancos: “Pagar com código”).
          </li>
          <li>
            Cole o código, confira o valor de <b>{price}</b> e confirme.
          </li>
        </ol>

        <p className="pay-wait" aria-live="polite">
          <span className="pay-dot" aria-hidden="true" /> Esta página mostra a confirmação sozinha assim que o pagamento cair.
        </p>

        {page.qrCodeBase64 && (
          <details className="pay-qr">
            <summary>Vai pagar por outro celular ou pelo computador? Mostrar QR Code</summary>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={"data:image/png;base64," + page.qrCodeBase64} alt="QR Code do Pix" width={220} height={220} />
          </details>
        )}
        {page.expiresAt && (
          <p className="pay-small">
            Código válido até{" "}
            {new Date(page.expiresAt).toLocaleString("pt-BR", {
              timeZone: "America/Sao_Paulo",
              dateStyle: "short",
              timeStyle: "short",
            })}
            . Pagamento seguro pelo Mercado Pago.
          </p>
        )}
      </section>
      <a className="pay-help" href={WA + encodeURIComponent("Olá! Estou com dificuldade para pagar o Pix.")} target="_blank" rel="noopener noreferrer">
        <WhatsappLogo size={18} weight="fill" aria-hidden="true" /> Não conseguiu? Fale com a gente
      </a>
    </main>
  );
}

function Logo() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="pay-logo" src="/brand/logo-transparent.png" alt="CurriculosPRO" />
  );
}
