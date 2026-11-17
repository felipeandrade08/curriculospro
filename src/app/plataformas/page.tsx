import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PLATFORMS } from "@/lib/platforms";

export const metadata: Metadata = {
  title: "Sites de vagas: como preencher Gupy, LinkedIn, Indeed, Infojobs e Catho",
  description:
    "Passo a passo para cadastrar o currículo nos principais sites de vagas, com seus dados prontos para copiar, respostas para as perguntas da candidatura e vagas com um toque.",
  alternates: { canonical: "/plataformas" },
};

export default function PlatformsIndex() {
  return (
    <main className="lp">
      <SiteHeader />
      <section className="wrap page-head">
        <h1>Seu currículo em todos os sites de vagas</h1>
        <p>
          Cada site pede para você digitar tudo de novo. Aqui seus dados aparecem prontos para copiar, com o
          passo a passo de cada plataforma e as vagas da sua área com um toque.
        </p>
      </section>
      <section className="wrap gd-list">
        {PLATFORMS.map((p) => (
          <Link key={p.slug} href={"/plataformas/" + p.slug}>
            <b>{p.name}</b>
            <span>{p.short}</span>
          </Link>
        ))}
        <Link href="/respostas-candidatura" className="pf-hl">
          <b>Perguntas da candidatura</b>
          <span>Respostas prontas para “Fale sobre você”, “Por que quer trabalhar aqui?” e pretensão salarial.</span>
        </Link>
      </section>
      <SiteFooter />
    </main>
  );
}
