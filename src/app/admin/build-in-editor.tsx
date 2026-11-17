"use client";
import { parseResume } from "@/lib/import/parse";
import { emptyResumeData, type ResumeDocument } from "@/lib/resume";
import { saveNewResume } from "@/lib/start";

type Data = {
  name: string;
  whatsapp: string;
  role: string;
  city: string;
  notes: string;
  sourceText: string;
  resume: ResumeDocument | null;
};

/** Abre o pedido no editor deste navegador, já com os dados do cliente, para a equipe montar. */
export function BuildInEditor({ id, data }: { id: string; data: Data }) {
  const open = () => {
    const base =
      data.resume?.cv ||
      (data.sourceText.trim().length > 30 ? parseResume(data.sourceText).cv : emptyResumeData());
    const cv = {
      ...base,
      name: data.name || base.name,
      role: data.role || base.role,
      city: data.city || base.city,
      phone: base.phone || data.whatsapp,
    };
    saveNewResume(cv, {
      title: "Pedido #" + id + " — " + (data.name.split(" ")[0] || "cliente"),
      template: data.resume?.template,
      accent: data.resume?.accent,
    });
    // Abre no mesmo separador: a barra da equipe no editor tem a entrega e o botão de voltar ao painel.
    location.href = "/editor";
  };
  return (
    <button type="button" className="cpa-btn ghost small" onClick={open}>
      Montar no editor
    </button>
  );
}
