"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { whatsappDeliveryUrl } from "@/lib/delivery-message";
import { ResumePicker } from "./resume-picker";

type Cloud = { id: string; title: string; updated: string };
type Props = {
  paymentId: string;
  name: string;
  phone: string;
  cloud: Cloud[];
  /** Link já gerado (venda entregue). */
  link?: string;
  inAccount?: boolean;
  /** Já abre o formulário (logo depois do pagamento). */
  open?: boolean;
};

/** Depois do Pix pago: escolhe o currículo e gera o link para o cliente baixar em PDF e Word. */
export function ChargeDeliver({ paymentId, name, phone, cloud, link: initial, inAccount = false, open = false }: Props) {
  const router = useRouter();
  const [show, setShow] = useState(open);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [link, setLink] = useState(initial || "");
  const [emailed, setEmailed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (link)
    return (
      <div className="cpa-charge-link">
        <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} aria-label="Link do currículo" />
        <div className="cpa-pix-actions">
          <button
            type="button"
            className="cpa-btn small"
            onClick={() => {
              void navigator.clipboard?.writeText(link);
              setCopied(true);
            }}
          >
            {copied ? "Copiado ✓" : "Copiar link"}
          </button>
          {phone.replace(/\D/g, "").length >= 10 && (
            <a
              className="cpa-btn small wa"
              href={whatsappDeliveryUrl(phone, name, link, inAccount)}
              target="_blank"
              rel="noreferrer"
            >
              Enviar no WhatsApp
            </a>
          )}
          <a className="cpa-btn small ghost" href={link} target="_blank" rel="noreferrer">
            Abrir
          </a>
        </div>
        {emailed && <small className="cpa-muted">Também enviamos por e-mail, com PDF e Word anexados.</small>}
      </div>
    );

  if (!show)
    return (
      <button type="button" className="cpa-btn small" onClick={() => setShow(true)}>
        Entregar currículo
      </button>
    );

  return (
    <form
      className="cpa-deliver cpa-charge-deliver"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          const form = new FormData(e.currentTarget);
          form.set("paymentId", paymentId);
          const r = await fetch("/api/admin/pix/entregar", { method: "POST", body: form });
          const d = await r.json().catch(() => ({}));
          if (!r.ok || !d.ok) throw new Error(d.message || "Não foi possível gerar o link.");
          setLink(d.link);
          setEmailed(!!d.emailed);
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Não foi possível gerar o link.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <ResumePicker requestId={"pix-" + paymentId} cloud={cloud} />
      <label className="wide">
        <span>PDF pronto (opcional: sem anexo, o site gera o PDF sozinho)</span>
        <input name="pdf" type="file" accept="application/pdf,.pdf" />
      </label>
      <label className="wide">
        <span>Recado para o cliente (opcional)</span>
        <input name="note" maxLength={500} placeholder="Ex.: Boa sorte nas entrevistas!" />
      </label>
      {error && (
        <p className="cpa-pix-error" role="alert">
          {error}
        </p>
      )}
      <button className="cpa-btn small" type="submit" disabled={busy}>
        {busy ? "Gerando link…" : "Gerar link do currículo"}
      </button>
    </form>
  );
}
