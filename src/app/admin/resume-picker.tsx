"use client";
import { useEffect, useState } from "react";
import type { ResumeDocument } from "@/lib/resume";
import { readLibrary } from "@/lib/start";

type Cloud = { id: string; title: string; updated: string };

/**
 * Escolha do currículo a entregar: mostra os currículos deste navegador (onde a equipe monta)
 * e os já salvos na nuvem da conta. Não precisa sincronizar antes.
 */
export function ResumePicker({ requestId, cloud }: { requestId: string; cloud: Cloud[] }) {
  const [local, setLocal] = useState<ResumeDocument[]>([]);
  const [value, setValue] = useState("");

  useEffect(() => {
    const docs = readLibrary().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    setLocal(docs);
    // Seleciona sozinho o currículo criado por "Montar no editor" para este pedido.
    const mine = docs.find((d) => d.title.startsWith("Pedido #" + requestId + " "));
    if (mine) setValue("local:" + mine.id);
  }, [requestId]);

  const chosen = value.startsWith("local:") ? local.find((d) => "local:" + d.id === value) : null;
  const when = (iso: string) =>
    new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

  return (
    <label>
      <span>Currículo pronto</span>
      <select required value={value} onChange={(e) => setValue(e.target.value)}>
        <option value="" disabled>
          {local.length || cloud.length ? "Escolha…" : "Nenhum currículo neste navegador"}
        </option>
        {local.length > 0 && (
          <optgroup label="Neste navegador">
            {local.map((d) => (
              <option key={d.id} value={"local:" + d.id}>
                {d.title || d.cv.name || "Sem título"} — {when(d.updatedAt)}
              </option>
            ))}
          </optgroup>
        )}
        {cloud.length > 0 && (
          <optgroup label="Salvos na nuvem">
            {cloud.map((c) => (
              <option key={c.id} value={"cloud:" + c.id}>
                {c.title} — {when(c.updated)}
              </option>
            ))}
          </optgroup>
        )}
      </select>
      <input type="hidden" name="resumeId" value={value.startsWith("cloud:") ? value.slice(6) : ""} />
      <input type="hidden" name="resumeJson" value={chosen ? JSON.stringify(chosen) : ""} />
    </label>
  );
}
