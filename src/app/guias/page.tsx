import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { GUIDES } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guias para conseguir emprego",
  description:
    "Guias práticos sobre currículo sem experiência, Jovem Aprendiz, objetivo profissional, como enviar currículo e entrevista de emprego.",
  alternates: { canonical: "/guias" },
};

export default function GuidesIndex() {
  return (
    <main className="lp">
      <SiteHeader />
      <section className="wrap page-head">
        <h1>Guias para conseguir emprego</h1>
        <p>Respostas curtas e práticas para as dúvidas de quem está procurando trabalho.</p>
      </section>
      <section className="wrap gd-list">
        {GUIDES.map((g) => (
          <Link key={g.slug} href={"/guias/" + g.slug}>
            <b>{g.title}</b>
            <span>{g.description}</span>
          </Link>
        ))}
      </section>
      <SiteFooter />
    </main>
  );
}
