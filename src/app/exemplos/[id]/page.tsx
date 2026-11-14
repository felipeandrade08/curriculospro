import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ResumeThumb } from "@/components/resume-view";
import { RESUME_EXAMPLES, exampleById } from "@/lib/examples";
import { CATEGORY_TIPS } from "@/lib/example-tips";
import { templateMeta } from "@/lib/templates";
import { defaultOrder, type ResumeData } from "@/lib/resume";
import { ACCESS_PRICE_LABEL } from "@/lib/billing";

export const dynamicParams = false;
export function generateStaticParams() {
  return RESUME_EXAMPLES.map((x) => ({ id: x.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const ex = exampleById(id);
  if (!ex) return {};
  return {
    title: `Modelo de currículo para ${ex.title}`,
    description: `Exemplo de currículo de ${ex.title.toLowerCase()} pronto para editar: objetivo, experiências, competências e cursos. Personalize online e baixe em PDF.`,
    alternates: { canonical: "/exemplos/" + ex.id },
  };
}

export default async function ExamplePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ex = exampleById(id);
  if (!ex) notFound();
  const cv: ResumeData = {
    ...ex.data,
    photo: "",
    experiences: ex.data.experiences.map((x, i) => ({ ...x, id: "e" + i })),
    education: ex.data.education.map((x, i) => ({ ...x, id: "d" + i })),
  };
  const meta = templateMeta(ex.template);
  const related = RESUME_EXAMPLES.filter((x) => x.category === ex.category && x.id !== ex.id).slice(0, 3);
  const others = related.length ? related : RESUME_EXAMPLES.filter((x) => x.id !== ex.id).slice(0, 3);
  const useHref = "/editor?new=example&example=" + ex.id;
  return (
    <main className="lp">
      <SiteHeader active="exemplos" />
      <div className="wrap crumbs">
        <Link href="/exemplos">Exemplos</Link>
        <span aria-hidden="true">/</span>
        <Link href={"/exemplos?area=" + encodeURIComponent(ex.category)}>{ex.category}</Link>
      </div>
      <section className="wrap ex-detail">
        <div className="ex-paper">
          <ResumeThumb
            width={560}
            cv={cv}
            template={ex.template}
            accent={ex.accent}
            density="comfortable"
            sections={defaultOrder}
          />
        </div>
        <div className="ex-side">
          <h1>Currículo de {ex.title.toLowerCase()}</h1>
          <p className="ex-lead">
            Um exemplo completo para você usar como base. Abra no editor, troque pelos seus dados e mude o
            modelo se preferir outro visual.
          </p>
          <Link href={useHref} className="btn btn-primary btn-lg ex-cta">
            Usar este exemplo
          </Link>
          <p className="ex-note">
            Modelo {meta.name}. Editar é grátis; o PDF sai por {ACCESS_PRICE_LABEL} com 7 dias de acesso.
          </p>
          <div className="ex-tips">
            <h2>Dicas para {ex.category.toLowerCase()}</h2>
            <ul>
              {CATEGORY_TIPS[ex.category].map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
          <div className="ex-skills">
            <h2>Competências usadas neste exemplo</h2>
            <p>{ex.data.skills.join(", ")}.</p>
          </div>
        </div>
      </section>
      <section className="wrap ex-related" aria-labelledby="related-title">
        <h2 id="related-title">Outros exemplos</h2>
        <div className="example-grid">
          {others.map((o) => (
            <Link key={o.id} href={"/exemplos/" + o.id} className="example-card">
              <div className="example-paper">
                <ResumeThumb
                  width={236}
                  cv={{
                    ...o.data,
                    photo: "",
                    experiences: o.data.experiences.map((x, i) => ({ ...x, id: "e" + i })),
                    education: o.data.education.map((x, i) => ({ ...x, id: "d" + i })),
                  }}
                  template={o.template}
                  accent={o.accent}
                  density="comfortable"
                  sections={defaultOrder}
                />
              </div>
              <span className="example-title">{o.title}</span>
              <span className="example-cat">{o.category}</span>
            </Link>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
