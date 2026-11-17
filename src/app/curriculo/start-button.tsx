"use client";
import { useState } from "react";
import { emptyResumeData, uid, type ResumeData } from "@/lib/resume";
import { saveNewResume } from "@/lib/start";
import type { TemplateId } from "@/lib/templates";

/** Cria um currículo já com objetivo, atividades e competências da profissão e abre o editor. */
export function StartProfession(props: {
  name: string;
  objective: string;
  activities: string[];
  skills: string[];
  courses: string[];
  template: TemplateId;
  accent: string;
  className?: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const start = () => {
    setBusy(true);
    const role = props.name.replace(/\s*\/.*$/, "").replace(/\(a\)/g, "");
    const cv: ResumeData = {
      ...emptyResumeData(),
      role,
      summary: props.objective,
      skills: [...props.skills],
      courses: [...props.courses],
      experiences: [
        {
          id: uid(),
          title: role,
          subtitle: "",
          period: "",
          description: props.activities.map((a) => "• " + a).join("\n"),
        },
      ],
    };
    saveNewResume(cv, { title: "Currículo — " + role, template: props.template, accent: props.accent });
    location.href = "/editor";
  };
  return (
    <button type="button" className={props.className || "btn btn-primary btn-lg"} onClick={start} disabled={busy}>
      {busy ? "Abrindo o editor…" : props.label || "Começar com este modelo"}
    </button>
  );
}
