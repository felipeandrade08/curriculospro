import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ResumeThumb } from "@/components/resume-view";
import { exampleById } from "@/lib/examples";
import { PROFESSIONS, professionBySlug } from "@/lib/professions";
import { defaultOrder, type ResumeData } from "@/lib/resume";
import { ACCESS_PRICE_LABEL } from "@/lib/billing";
import { StartProfession } from "../start-button";
import { JobSearch } from "@/components/job-search";

export const dynamicParams = false;
export function generateStaticParams() {
  return PROFESSIONS.map((p) => ({ slug: p.slug }));
}

const lower = (s: string) => s.replace(/\(a\)/g, "").toLowerCase();

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = professionBySlug(slug);
  if (!p) return {};
  return {
    title: `Currículo de ${lower(p.name)}: modelo, objetivo e exemplo pronto`,
    description: `Como fazer o currículo de ${lower(p.name)}: exemplo de objetivo, atividades, habilidades e cursos para colocar. Comece com o modelo pronto, edite grátis e baixe em PDF.`,
    alternates: { canonical: "/curriculo/" + p.slug },
  };
}

export default async function ProfessionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = professionBySlug(slug);
  if (!p) notFound();
  const ex = exampleById(p.example)!;
  const role = p.name.replace(/\s*\/.*$/, "");
  const cv: ResumeData = {
    ...ex.data,
    role,
    summary: p.objective,
    photo: "",
    skills: p.skills,
    courses: p.courses,
    experiences: [
      {
        id: "e0",
        title: role.replace(/\(a\)/g, ""),
        subtitle: "Empresa onde você trabalhou",
        period: "2022 — atual",
        description: p.activities.map((a) => "• " + a).join("\n"),
      },
    ],
    education: ex.data.education.map((x, i) => ({ ...x, id: "d" + i })),
  };
  const faq = [
    { q: `O que colocar no objetivo do currículo de ${lower(p.name)}?`, a: p.objective },
    {
      q: `Quais habilidades colocar no currículo de ${lower(p.name)}?`,
      a: p.skills.join(", ") + ". Coloque só o que você realmente sabe fazer.",
    },
    {
      q: `Que cursos ajudam no currículo de ${lower(p.name)}?`,
      a: p.courses.join(", ") + ". Cursos online gratuitos também contam.",
    },
    {
      q: "Quantas páginas o currículo deve ter?",
      a: "Uma página é o ideal para a maioria das vagas. Duas só se você tiver muitos anos de experiência relevante.",
    },
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const related = PROFESSIONS.filter((x) => x.area === p.area && x.slug !== p.slug).slice(0, 6);
  return (
    <main className="lp">
      <SiteHeader active="exemplos" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="wrap crumbs">
        <Link href="/curriculo">Currículo por profissão</Link>
        <span aria-hidden="true">/</span>
        <span>{p.name}</span>
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
        <div className="ex-side pf">
          <h1>Currículo de {lower(p.name)}</h1>
          <p className="ex-lead">
            Um modelo pronto com objetivo, atividades e competências da área. Comece com ele, troque pelos seus
            dados e ajuste o que for diferente na sua trajetória.
          </p>
          <StartProfession
            name={p.name}
            objective={p.objective}
            activities={p.activities}
            skills={p.skills}
            courses={p.courses}
            template={ex.template}
            accent={ex.accent}
          />
          <p className="ex-note">Editar é grátis. O PDF sai por {ACCESS_PRICE_LABEL} com 7 dias de acesso.</p>

          <div className="pf-block">
            <h2>Exemplo de objetivo</h2>
            <blockquote>{p.objective}</blockquote>
          </div>
          <div className="pf-block">
            <h2>Atividades para descrever a experiência</h2>
            <ul>
              {p.activities.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
          <div className="pf-block">
            <h2>Habilidades que os recrutadores procuram</h2>
            <div className="pf-chips">
              {p.skills.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </div>
          <div className="pf-block">
            <h2>Cursos que fazem diferença</h2>
            <ul>
              {p.courses.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          <div className="pf-block ex-tips">
            <h2>Dicas para o currículo de {lower(p.name)}</h2>
            <ul>
              {p.tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div className="pf-block">
            <JobSearch role={p.name} />
          </div>
          <div className="pf-block pf-cta">
            <b>Achou uma vaga?</b>
            <p>Cole o anúncio e veja se o seu currículo tem o que ela pede antes de enviar.</p>
            <Link href="/adaptar-vaga">Comparar meu currículo com a vaga</Link>
          </div>
        </div>
      </section>
      <section className="wrap pf-faq" aria-labelledby="faq-title">
        <h2 id="faq-title">Perguntas frequentes</h2>
        {faq.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </section>
      {related.length > 0 && (
        <section className="wrap pf-related" aria-labelledby="rel-title">
          <h2 id="rel-title">Outras profissões da área</h2>
          <div className="pf-links">
            {related.map((r) => (
              <Link key={r.slug} href={"/curriculo/" + r.slug}>
                Currículo de {lower(r.name)}
              </Link>
            ))}
          </div>
        </section>
      )}
      <SiteFooter />
    </main>
  );
}
