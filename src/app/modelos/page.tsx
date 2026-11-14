import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ResumeThumb } from "@/components/resume-view";
import { exampleById } from "@/lib/examples";
import { TEMPLATES } from "@/lib/templates";
import { defaultOrder, type ResumeData } from "@/lib/resume";

export const metadata: Metadata = {
  title: "Modelos de currículo",
  description:
    "10 modelos de currículo profissionais para preencher online: clássicos, modernos, com coluna lateral, elegantes e compactos. Todos cabem em uma página A4.",
  alternates: { canonical: "/modelos" },
};

export default function Models() {
  const sample = exampleById("customer-service")!;
  const cv: ResumeData = {
    ...sample.data,
    photo: "",
    experiences: sample.data.experiences.map((x, i) => ({ ...x, id: "e" + i })),
    education: sample.data.education.map((x, i) => ({ ...x, id: "d" + i })),
  };
  const layoutLabel = {
    single: "Uma coluna",
    "side-left": "Coluna à esquerda",
    "side-right": "Coluna à direita",
  };
  return (
    <main className="lp">
      <SiteHeader active="modelos" />
      <section className="wrap page-head">
        <h1>Modelos de currículo</h1>
        <p>
          Dez modelos testados para sair em uma página A4, com texto real e selecionável. Escolha um para
          começar; dá para trocar a qualquer momento sem perder nada do que você escreveu.
        </p>
      </section>
      <section className="wrap model-grid" aria-label="Modelos disponíveis">
        {TEMPLATES.map((t) => (
          <article className="model-card" key={t.id}>
            <Link
              href={"/editor?new=example&example=" + sample.id + "&template=" + t.id}
              className="model-paper"
              aria-label={"Ver o modelo " + t.name + " com um exemplo"}
            >
              <ResumeThumb
                width={300}
                cv={cv}
                template={t.id}
                accent={t.accent}
                density="comfortable"
                sections={defaultOrder}
              />
              {t.isNew && <span className="badge-new">Novo</span>}
            </Link>
            <div className="model-info">
              <h2>{t.name}</h2>
              <p>{t.description}</p>
              <ul className="model-meta">
                <li>{layoutLabel[t.layout]}</li>
                <li>{t.photo ? "Aceita foto" : "Sem foto"}</li>
                <li>Indicado para {t.bestFor.toLowerCase()}</li>
              </ul>
              <div className="model-actions">
                <Link href={"/editor?new=blank&template=" + t.id} className="btn btn-primary">
                  Usar este modelo
                </Link>
                <Link
                  href={"/editor?new=example&example=" + sample.id + "&template=" + t.id}
                  className="btn btn-ghost"
                >
                  Ver com exemplo
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>
      <section className="wrap cta-strip">
        <div>
          <h2>Não sabe por onde começar?</h2>
          <p>Veja currículos prontos da sua área e use um deles como base.</p>
        </div>
        <Link href="/exemplos" className="btn btn-primary btn-lg">
          Ver exemplos por profissão
        </Link>
      </section>
      <SiteFooter />
    </main>
  );
}
