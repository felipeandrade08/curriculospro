import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PROFESSIONS } from "@/lib/professions";

export const metadata: Metadata = {
  title: "Currículo por profissão: modelos e exemplos de objetivo",
  description:
    "Modelos de currículo prontos para 30 profissões: objetivo, atividades, habilidades e cursos para auxiliar administrativo, vendedor, jovem aprendiz, motorista, técnico de enfermagem e mais.",
  alternates: { canonical: "/curriculo" },
};

export default function ProfessionsIndex() {
  const areas = [...new Set(PROFESSIONS.map((p) => p.area))];
  return (
    <main className="lp">
      <SiteHeader active="exemplos" />
      <section className="wrap page-head">
        <h1>Currículo por profissão</h1>
        <p>
          Escolha sua área e veja o que colocar no objetivo, nas atividades e nas habilidades. Cada página tem
          um modelo pronto para você começar.
        </p>
      </section>
      <section className="wrap pf-index">
        {areas.map((area) => (
          <div key={area}>
            <h2>{area}</h2>
            <div className="pf-links">
              {PROFESSIONS.filter((p) => p.area === area).map((p) => (
                <Link key={p.slug} href={"/curriculo/" + p.slug}>
                  {p.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
      <SiteFooter />
    </main>
  );
}
