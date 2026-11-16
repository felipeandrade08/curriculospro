"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  FileArrowUp,
  IdentificationCard,
  MagnifyingGlass,
  PencilSimpleLine,
} from "@phosphor-icons/react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ResumeThumb } from "@/components/resume-view";
import { EXAMPLE_CATEGORIES, RESUME_EXAMPLES, type ExampleCategory } from "@/lib/examples";
import { defaultOrder, type ProfessionalProfile, type ResumeData, type ResumeDocument } from "@/lib/resume";
import { trackUsage } from "@/lib/analytics";
import { profileHasContent, readLibrary, readProfile, resumeFromProfile, saveNewResume } from "@/lib/start";

const fold = (s: string) => s.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[̀-ͯ]/g, "");

const thumbData = (id: string): ResumeData => {
  const ex = RESUME_EXAMPLES.find((x) => x.id === id)!;
  return {
    ...ex.data,
    photo: "",
    experiences: ex.data.experiences.map((x, i) => ({ ...x, id: "e" + i })),
    education: ex.data.education.map((x, i) => ({ ...x, id: "d" + i })),
  };
};

export default function StartPage() {
  const router = useRouter();
  const [last, setLast] = useState<ResumeDocument | null>(null);
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ExampleCategory | "">("");

  useEffect(() => {
    trackUsage("start_page_view");
    const docs = readLibrary().sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
    setLast(docs[0] || null);
    const p = readProfile();
    setProfile(profileHasContent(p) ? p : null);
  }, []);

  const examples = useMemo(() => {
    const q = fold(query.trim());
    return RESUME_EXAMPLES.filter(
      (x) =>
        (!category || x.category === category) &&
        (!q ||
          fold(x.title + " " + x.category + " " + x.data.role + " " + x.data.skills.join(" ")).includes(q)),
    );
  }, [query, category]);

  const fromProfile = () => {
    if (!profile) return;
    saveNewResume(resumeFromProfile(profile), {
      title: "Currículo de " + (profile.name.split(" ")[0] || "perfil"),
    });
    router.push("/editor");
  };

  return (
    <main className="lp st">
      <SiteHeader />
      <section className="wrap st-head">
        <h1>Como você quer começar?</h1>
        <p>Escolha o caminho mais rápido para você. Em qualquer um deles dá para mudar tudo depois.</p>
      </section>

      {last && (
        <section className="wrap st-continue" aria-label="Continuar currículo">
          <div>
            <span>Continuar de onde parou</span>
            <b>{last.title || last.cv.name || "Meu currículo"}</b>
            <small>
              {last.updatedAt ? "Editado em " + new Date(last.updatedAt).toLocaleDateString("pt-BR") : ""}
            </small>
          </div>
          <div className="st-continue-actions">
            <Link className="btn btn-ghost" href="/curriculos">
              Ver todos
            </Link>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                localStorage.setItem("curriculospro.activeResume.v3", last.id);
                router.push("/editor");
              }}
            >
              Continuar
            </button>
          </div>
        </section>
      )}

      <section className="wrap st-paths" aria-label="Formas de começar">
        <Link href="/importar" className="st-path st-path-main">
          <FileArrowUp size={34} weight="duotone" aria-hidden="true" />
          <div>
            <h2>Já tenho um currículo</h2>
            <p>
              Envie o PDF ou Word antigo. Separamos nome, experiências, formação e cursos — você só confere e
              atualiza.
            </p>
            <span className="st-go">
              Importar currículo <ArrowRight size={16} aria-hidden="true" />
            </span>
          </div>
        </Link>

        {profile ? (
          <button type="button" className="st-path" onClick={fromProfile}>
            <IdentificationCard size={30} weight="duotone" aria-hidden="true" />
            <div>
              <h2>Usar meu Perfil Profissional</h2>
              <p>
                Montamos o currículo com {profile.experiences.length} experiência(s),{" "}
                {profile.education.length} formação(ões) e suas habilidades já salvas.
              </p>
              <span className="st-go">
                Montar agora <ArrowRight size={16} aria-hidden="true" />
              </span>
            </div>
          </button>
        ) : null}

        <Link href="/editor?new=blank" className="st-path">
          <PencilSimpleLine size={30} weight="duotone" aria-hidden="true" />
          <div>
            <h2>Começar do zero</h2>
            <p>
              Respondemos junto com você, uma etapa por vez, com sugestões de frases para a sua profissão.
            </p>
            <span className="st-go">
              Preencher passo a passo <ArrowRight size={16} aria-hidden="true" />
            </span>
          </div>
        </Link>
      </section>

      <section className="wrap st-examples" aria-labelledby="st-ex-title">
        <div className="st-ex-head">
          <div>
            <h2 id="st-ex-title">Ou parta de um currículo pronto da sua profissão</h2>
            <p>O exemplo já vem com objetivo, atividades e habilidades. Troque pelos seus dados e pronto.</p>
          </div>
          <label className="st-search">
            <MagnifyingGlass size={18} aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar profissão: vendedor, recepcionista…"
              aria-label="Buscar profissão"
            />
          </label>
        </div>
        <div className="chip-row" role="group" aria-label="Filtrar por área">
          <button
            type="button"
            className={"chip" + (!category ? " is-on" : "")}
            onClick={() => setCategory("")}
          >
            Todas
          </button>
          {EXAMPLE_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={"chip" + (category === c ? " is-on" : "")}
              onClick={() => setCategory(category === c ? "" : c)}
            >
              {c}
            </button>
          ))}
        </div>
        {examples.length ? (
          <ul className="st-ex-grid">
            {examples.map((ex) => (
              <li key={ex.id}>
                <Link href={"/editor?new=example&example=" + ex.id} className="st-ex">
                  <ResumeThumb
                    width={168}
                    cv={thumbData(ex.id)}
                    template={ex.template}
                    accent={ex.accent}
                    density="comfortable"
                    sections={defaultOrder}
                  />
                  <b>{ex.title}</b>
                  <small>{ex.category}</small>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="st-empty">
            Não temos um exemplo com esse nome ainda. Comece do zero: no editor sugerimos frases para qualquer
            profissão que você digitar.
          </p>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
