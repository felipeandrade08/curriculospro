import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { GUIDES, guideBySlug } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;
export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = guideBySlug(slug);
  if (!g) return {};
  return { title: g.title, description: g.description, alternates: { canonical: "/guias/" + g.slug } };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = guideBySlug(slug);
  if (!g) notFound();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.title,
    description: g.description,
    inLanguage: "pt-BR",
    mainEntityOfPage: SITE_URL + "/guias/" + g.slug,
    publisher: { "@type": "Organization", name: "CurriculosPRO", url: SITE_URL },
  };
  const others = GUIDES.filter((x) => x.slug !== g.slug).slice(0, 4);
  return (
    <main className="lp">
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="wrap crumbs">
        <Link href="/guias">Guias</Link>
      </div>
      <article className="wrap gd">
        <h1>{g.title}</h1>
        <p className="gd-intro">{g.intro}</p>
        {g.sections.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            {s.p?.map((t) => (
              <p key={t}>{t}</p>
            ))}
            {s.list && (
              <ul>
                {s.list.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
        <div className="gd-cta">
          <p>Monte seu currículo com modelos prontos e edite grátis.</p>
          <Link className="btn btn-primary btn-lg" href={g.cta.href}>
            {g.cta.label}
          </Link>
        </div>
        <nav className="gd-more" aria-label="Outros guias">
          <h2>Leia também</h2>
          <div className="pf-links">
            {others.map((o) => (
              <Link key={o.slug} href={"/guias/" + o.slug}>
                {o.title}
              </Link>
            ))}
          </div>
        </nav>
      </article>
      <SiteFooter />
    </main>
  );
}
