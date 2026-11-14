import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ResumeThumb } from "@/components/resume-view";
import { EXAMPLE_CATEGORIES, RESUME_EXAMPLES, type ExampleCategory } from "@/lib/examples";
import { defaultOrder } from "@/lib/resume";

export const metadata: Metadata = {
  title: "Exemplos de currículo por profissão",
  description:
    "Exemplos de currículo prontos para jovem aprendiz, vendedor, auxiliar administrativo, técnico de enfermagem, motorista, desenvolvedor e outras profissões. Use como base e edite online.",
  alternates: { canonical: "/exemplos" },
};

export default async function ExamplesPage({ searchParams }: { searchParams: Promise<{ area?: string }> }) {
  const { area } = await searchParams;
  const current = EXAMPLE_CATEGORIES.find((c) => c === area) as ExampleCategory | undefined;
  const list = current ? RESUME_EXAMPLES.filter((x) => x.category === current) : RESUME_EXAMPLES;
  return (
    <main className="lp">
      <SiteHeader active="exemplos" />
      <section className="wrap page-head">
        <h1>Exemplos de currículo por profissão</h1>
        <p>
          Currículos completos, escritos para cada área. Abra um exemplo, troque pelos seus dados e ajuste o
          que for diferente na sua trajetória. Os nomes e contatos são fictícios.
        </p>
      </section>
      <nav className="wrap chip-row" aria-label="Filtrar por área">
        <Link
          href="/exemplos"
          className={"chip " + (!current ? "is-on" : "")}
          aria-current={!current ? "page" : undefined}
        >
          Todas as áreas
        </Link>
        {EXAMPLE_CATEGORIES.map((c) => (
          <Link
            key={c}
            href={"/exemplos?area=" + encodeURIComponent(c)}
            className={"chip " + (current === c ? "is-on" : "")}
            aria-current={current === c ? "page" : undefined}
          >
            {c}
          </Link>
        ))}
      </nav>
      <section className="wrap example-grid example-grid-lg" aria-label="Exemplos">
        {list.map((ex) => (
          <Link key={ex.id} href={"/exemplos/" + ex.id} className="example-card">
            <div className="example-paper">
              <ResumeThumb
                width={268}
                cv={{
                  ...ex.data,
                  photo: "",
                  experiences: ex.data.experiences.map((x, i) => ({ ...x, id: "e" + i })),
                  education: ex.data.education.map((x, i) => ({ ...x, id: "d" + i })),
                }}
                template={ex.template}
                accent={ex.accent}
                density="comfortable"
                sections={defaultOrder}
              />
            </div>
            <span className="example-title">{ex.title}</span>
            <span className="example-cat">{ex.category}</span>
          </Link>
        ))}
      </section>
      <SiteFooter />
    </main>
  );
}
