// Entrega de um pedido do "Fazemos para você": usada pelo painel e pela barra da equipe no editor.
import { defaultOrder, isResumeDocument, type ResumeDocument } from "@/lib/resume";
import { deliverRequest } from "@/lib/server/service";
import { MAX_FILE_BYTES, detectType, saveDeliveryPdf } from "@/lib/server/service-files";
import { deliveryUrl, fileSlug, loadDelivery } from "@/lib/server/delivery";
import { resumeToDocx } from "@/lib/server/docx";
import { renderBaseUrl, renderResumePdf } from "@/lib/server/pdf";
import { emailConfigured, sendEmail, serviceDeliveredEmail } from "@/lib/server/email";

export type DeliverResult = { ok: true; message: string; link: string; emailed: boolean } | { ok: false; message: string };

/** Campos: id, resumeId (nuvem) ou resumeJson (navegador), pdf (opcional), note (opcional). */
export async function deliverFromForm(formData: FormData, adminUserId: string): Promise<DeliverResult> {
  const id = String(formData.get("id") || "");
  const resumeId = String(formData.get("resumeId") || "");
  const note =
    String(formData.get("note") || "")
      .trim()
      .slice(0, 500) || null;
  let doc: ResumeDocument | null = null;
  try {
    const raw = String(formData.get("resumeJson") || "");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isResumeDocument(parsed)) doc = parsed;
    }
  } catch {}
  if (!/^\d+$/.test(id) || (!resumeId && !doc)) return { ok: false, message: "Escolha o currículo que será entregue." };

  let pdf: Uint8Array | null = null;
  const file = formData.get("pdf");
  if (file && typeof file === "object" && "arrayBuffer" in file && file.size > 0) {
    if (file.size > MAX_FILE_BYTES) return { ok: false, message: "O PDF passa de 4 MB." };
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (detectType(bytes, "application/pdf") !== "application/pdf")
      return { ok: false, message: "O arquivo anexado não é um PDF." };
    pdf = bytes;
  }

  let result: Awaited<ReturnType<typeof deliverRequest>>;
  try {
    result = await deliverRequest(id, adminUserId, doc ? { doc } : { resumeId }, note);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Não foi possível entregar." };
  }
  const base = "Curriculo-" + fileSlug(result.name || "cliente");
  // Sem PDF anexado, o próprio site gera o PDF do currículo entregue.
  if (!pdf) {
    try {
      const delivery = await loadDelivery(id);
      if (delivery) pdf = await renderResumePdf(renderBaseUrl(), delivery.resume, { scale: "auto" });
    } catch (error) {
      console.error("PDF automático da entrega falhou", id, error);
    }
  }
  if (pdf) await saveDeliveryPdf(id, result.userId, base + ".pdf", pdf).catch((e) => console.error("PDF da entrega", id, e));
  const link = deliveryUrl(id, result.deliveredAt);

  let emailed = false;
  if (emailConfigured() && result.email) {
    const attachments: { filename: string; content: Uint8Array }[] = [];
    if (pdf) attachments.push({ filename: base + ".pdf", content: pdf });
    try {
      const delivery = await loadDelivery(id);
      if (delivery) {
        const docx = await resumeToDocx(delivery.resume.cv, {
          accent: delivery.resume.accent,
          order: delivery.resume.sectionOrder.length ? delivery.resume.sectionOrder : defaultOrder,
          hidden: delivery.resume.hidden,
        });
        attachments.push({ filename: base + ".docx", content: new Uint8Array(docx) });
      }
    } catch (error) {
      console.error("Word da entrega falhou", id, error);
    }
    emailed = await sendEmail({
      to: result.email,
      ...serviceDeliveredEmail({
        name: result.name,
        note,
        link,
        attached: attachments.map((a) => (a.filename.endsWith(".pdf") ? "PDF" : "Word")),
      }),
      attachments,
      idempotencyKey: "svc-delivered-" + id,
    })
      .then((r) => r.sent)
      .catch((error) => {
        console.error("Aviso de entrega falhou", id, error);
        return false;
      });
  }
  return {
    ok: true,
    link,
    emailed,
    message:
      "Pedido #" +
      id +
      " entregue" +
      (emailed ? " e enviado por e-mail com os anexos" : "") +
      ". Se o cliente preferir WhatsApp, use o botão “Enviar no WhatsApp” no pedido.",
  };
}
