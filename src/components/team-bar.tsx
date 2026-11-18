"use client";
import { WhatsappLogo } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import type { ResumeDocument } from "@/lib/resume";
import { useTeam } from "@/components/team-flag";
import { whatsappDeliveryUrl } from "@/lib/delivery-message";

type Order = {
  id: string;
  status: string;
  email: string;
  name: string;
  role: string;
  city: string;
  whatsapp: string;
  notes: string;
  sourceText: string;
  delivery: "email" | "whatsapp";
  link: string | null;
  files: { id: string; filename: string; kind: string; size: number }[];
};

/** Barra da equipe no editor: dados do pedido e entrega sem sair do editor. */
export function TeamBar({ title, getDoc }: { title: string; getDoc: () => ResumeDocument }) {
  const team = useTeam();
  const orderId = /^Pedido #(\d+)/.exec(title || "")?.[1] || "";
  const [order, setOrder] = useState<Order | null>(null);
  const [panel, setPanel] = useState<"" | "dados" | "entregar">("");
  const [pdf, setPdf] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!team || !orderId) return setOrder(null);
    let alive = true;
    fetch("/api/admin/pedido/" + orderId, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && setOrder(d?.order || null))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [team, orderId]);

  if (!team) return null;

  const deliver = async () => {
    if (!order) return;
    setBusy(true);
    setMsg(null);
    try {
      const form = new FormData();
      form.set("resumeJson", JSON.stringify(getDoc()));
      form.set("note", note);
      if (pdf) form.set("pdf", pdf);
      const r = await fetch("/api/admin/pedido/" + order.id + "/entregar", { method: "POST", body: form });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.ok) throw new Error(data.message || "Não foi possível entregar.");
      setOrder({ ...order, status: "delivered", link: data.link });
      setMsg({ ok: true, text: data.message });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Não foi possível entregar." });
    } finally {
      setBusy(false);
    }
  };

  const delivered = order?.status === "delivered";
  const wa = order && order.link ? whatsappDeliveryUrl(order.whatsapp, order.name, order.link) : "";

  return (
    <div className="tb">
      <div className="tb-row">
        <span className="tb-badge">Modo equipe</span>
        {order ? (
          <span className="tb-info">
            <b>
              Pedido #{order.id} · {order.name}
            </b>
            <span>
              {order.role}
              {order.city ? " · " + order.city : ""} · prefere {order.delivery === "whatsapp" ? "WhatsApp" : "e-mail"}
              {delivered ? " · entregue" : ""}
            </span>
          </span>
        ) : (
          <span className="tb-info">
            <span>{orderId ? "Carregando o pedido…" : "Downloads liberados para a equipe. Nada aqui conta nas métricas."}</span>
          </span>
        )}
        <span className="tb-actions">
          {order && (
            <>
              <button type="button" aria-pressed={panel === "dados"} onClick={() => setPanel(panel === "dados" ? "" : "dados")}>
                Dados do cliente
              </button>
              <button
                type="button"
                className="tb-primary"
                aria-pressed={panel === "entregar"}
                onClick={() => setPanel(panel === "entregar" ? "" : "entregar")}
              >
                {delivered ? "Entregue ✓" : "Entregar"}
              </button>
            </>
          )}
          <a href={"/admin" + (orderId ? "?aba=pedidos" : "")}>Painel</a>
        </span>
      </div>

      {order && panel === "dados" && (
        <div className="tb-panel">
          <p>
            <b>WhatsApp:</b> {order.whatsapp} · <b>Conta:</b> {order.email}
          </p>
          {order.notes && (
            <div>
              <b>Experiência contada pelo cliente</b>
              <pre>{order.notes}</pre>
            </div>
          )}
          {order.sourceText && (
            <details>
              <summary>Texto do currículo antigo</summary>
              <pre>{order.sourceText}</pre>
            </details>
          )}
          {order.files.filter((f) => f.kind === "upload").length > 0 && (
            <p className="tb-files">
              <b>Arquivos:</b>
              {order.files
                .filter((f) => f.kind === "upload")
                .map((f) => (
                  <a key={f.id} href={"/api/admin/servico-arquivo/" + f.id} target="_blank" rel="noopener noreferrer">
                    {f.filename}
                  </a>
                ))}
            </p>
          )}
        </div>
      )}

      {order && panel === "entregar" && (
        <div className="tb-panel">
          {delivered ? (
            <div className="tb-done">
              <p>{msg?.ok ? msg.text : "Este pedido já foi entregue."}</p>
              <div className="tb-actions">
                {wa && (
                  <a className="tb-primary" href={wa} target="_blank" rel="noopener noreferrer">
                    <WhatsappLogo size={18} weight="fill" aria-hidden="true" /> Enviar no WhatsApp
                  </a>
                )}
                {order.link && (
                  <a href={order.link} target="_blank" rel="noopener noreferrer">
                    Ver página de entrega
                  </a>
                )}
              </div>
            </div>
          ) : (
            <>
              <ol className="tb-steps">
                <li>Revise o currículo e clique em <b>Baixar PDF</b> (sai sem marca d&apos;água).</li>
                <li>Anexe o PDF aqui e, se quiser, deixe um recado.</li>
                <li>
                  Clique em <b>Entregar agora</b>: vai o currículo aberto neste editor, com PDF e Word por e-mail.
                </li>
              </ol>
              <div className="tb-form">
                <label>
                  <span>PDF do currículo</span>
                  <input type="file" accept="application/pdf,.pdf" onChange={(e) => setPdf(e.target.files?.[0] || null)} />
                </label>
                <label>
                  <span>Recado para o cliente (opcional)</span>
                  <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="Ex.: Destacamos seu atendimento." />
                </label>
                <button type="button" className="tb-primary" onClick={deliver} disabled={busy}>
                  {busy ? "Entregando…" : pdf ? "Entregar agora" : "Entregar sem PDF (só Word)"}
                </button>
              </div>
              {msg && !msg.ok && <p className="tb-err">{msg.text}</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
