// Lê o currículo ativo deste navegador (para personalizar entrevistas e mensagens).
import { ACTIVE_RESUME_KEY, type ResumeData } from "@/lib/resume";
import { readLibrary } from "@/lib/start";

export function readActiveResume(): ResumeData | null {
  try {
    const docs = readLibrary();
    const id = localStorage.getItem(ACTIVE_RESUME_KEY);
    return (docs.find((d) => d.id === id) || docs[0])?.cv || null;
  } catch {
    return null;
  }
}

export const firstName = (name: string) => name.trim().split(/\s+/)[0] || "";
export const plainRole = (role: string) => role.replace(/\(a\)|\(o\)/g, "").trim();
