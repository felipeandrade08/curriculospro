// Atalhos para começar um currículo: salvar um documento novo na biblioteca local,
// montar a partir do Perfil Profissional e ler o que já existe neste navegador.
import {
  ACTIVE_RESUME_KEY,
  PROFESSIONAL_PROFILE_KEY,
  RESUME_LIBRARY_KEY,
  createResume,
  isProfessionalProfile,
  uid,
  type ProfessionalProfile,
  type ResumeData,
  type ResumeDocument,
  type ResumeTemplate,
} from "@/lib/resume";
import { templateMeta } from "@/lib/templates";

export function readLibrary(): ResumeDocument[] {
  try {
    const docs = JSON.parse(localStorage.getItem(RESUME_LIBRARY_KEY) || "[]");
    return Array.isArray(docs) ? docs : [];
  } catch {
    return [];
  }
}

export function readProfile(): ProfessionalProfile | null {
  try {
    const p = JSON.parse(localStorage.getItem(PROFESSIONAL_PROFILE_KEY) || "null");
    return isProfessionalProfile(p) ? p : null;
  } catch {
    return null;
  }
}

export function profileHasContent(p: ProfessionalProfile | null): p is ProfessionalProfile {
  return !!p && !!(p.name || p.experiences.length || p.education.length || p.skills.length);
}

/** Salva um currículo novo, marca como ativo e devolve o id. */
export function saveNewResume(
  cv: ResumeData,
  opts: { title: string; template?: ResumeTemplate; accent?: string },
) {
  const doc = createResume("blank", opts.template || "essential");
  doc.title = opts.title;
  doc.cv = cv;
  doc.accent = opts.accent || templateMeta(doc.template).accent;
  const docs = readLibrary();
  localStorage.setItem(RESUME_LIBRARY_KEY, JSON.stringify([doc, ...docs]));
  localStorage.setItem(ACTIVE_RESUME_KEY, doc.id);
  return doc.id;
}

export function resumeFromProfile(p: ProfessionalProfile): ResumeData {
  return {
    name: p.name,
    role: p.experiences[0]?.title || "",
    email: p.email,
    phone: p.phone,
    city: p.city,
    summary: "",
    photo: p.photo,
    experiences: p.experiences.map((x) => ({ ...x, id: uid() })),
    education: p.education.map((x) => ({ ...x, id: uid() })),
    courses: [...p.courses],
    skills: [...p.skills],
    languages: [...p.languages],
  };
}

/** Junta o currículo importado ao Perfil Profissional sem apagar o que já estava lá. */
export function mergeIntoProfile(cv: ResumeData) {
  const current = readProfile();
  const key = (x: { title: string; subtitle: string; period: string }) =>
    [x.title, x.subtitle, x.period].map((v) => v.trim().toLowerCase()).join("|");
  const items = <T extends { title: string; subtitle: string; period: string }>(a: T[], b: T[]) => {
    const known = new Set(a.map(key));
    return [...a, ...b.filter((x) => !known.has(key(x)) && known.add(key(x)))];
  };
  const texts = (a: string[], b: string[]) => {
    const known = new Set(a.map((x) => x.trim().toLowerCase()));
    return [...a, ...b.filter((x) => x.trim() && !known.has(x.trim().toLowerCase()))];
  };
  const base = current || {
    version: 1 as const,
    updatedAt: "",
    name: "",
    email: "",
    phone: "",
    city: "",
    photo: "",
    experiences: [],
    education: [],
    courses: [],
    skills: [],
    languages: [],
  };
  const next: ProfessionalProfile = {
    ...base,
    updatedAt: new Date().toISOString(),
    name: base.name || cv.name,
    email: base.email || cv.email,
    phone: base.phone || cv.phone,
    city: base.city || cv.city,
    experiences: items(
      base.experiences,
      cv.experiences.map((x) => ({ ...x, id: uid() })),
    ),
    education: items(
      base.education,
      cv.education.map((x) => ({ ...x, id: uid() })),
    ),
    courses: texts(base.courses, cv.courses),
    skills: texts(base.skills, cv.skills),
    languages: texts(base.languages, cv.languages),
  };
  localStorage.setItem(PROFESSIONAL_PROFILE_KEY, JSON.stringify(next));
}
