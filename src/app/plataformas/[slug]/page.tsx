import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PLATFORMS, platformBySlug } from "@/lib/platforms";
import { PlatformKit } from "../kit";

export const dynamicParams = false;
export function generateStaticParams() {
  return PLATFORMS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = platformBySlug(slug);
  if (!p) return {};
  return {
    title: `Como preencher o currículo ${p.em} ${p.name}: passo a passo e dados prontos`,
    description: `Guia para cadastrar o currículo ${p.em} ${p.name}: o que preencher em cada campo, dicas para passar na triagem e seus dados prontos para copiar.`,
    alternates: { canonical: "/plataformas/" + p.slug },
  };
}

export default async function PlatformPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = platformBySlug(slug);
  if (!p) notFound();
  const others = PLATFORMS.filter((x) => x.slug !== p.slug);
  return (
    <main className="lp">
      <SiteHeader />
      <div className="wrap crumbs">
        <Link href="/plataformas">Sites de vagas</Link>
        <span aria-hidden="true">/</span>
        <span>{p.name}</span>
      </div>
      <section className="wrap pf-head">
        <h1>
          Como preencher o currículo {p.em} {p.name}
        </h1>
        <p className="gd-intro">{p.intro}</p>
      </section>
      <section className="wrap pf-twocol">
        <div className="pf-guide">
          <h2>Passo a passo</h2>
          <ol>
            {p.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <h2>Dicas</h2>
          <ul>
            {p.tips.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p className="pf-disclaimer">
            O CurriculosPRO não tem ligação com o {p.name}. Os nomes dos campos podem mudar na plataforma.
          </p>
        </div>
        <PlatformKit slug={p.slug} />
      </section>
      <section className="wrap pf-related">
        <h2>Outros sites de vagas</h2>
        <div className="pf-links">
          {others.map((o) => (
            <Link key={o.slug} href={"/plataformas/" + o.slug}>
              {o.name}
            </Link>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
