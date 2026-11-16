import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Stars, TestimonialCard } from "@/components/testimonials";
import { getTestimonials } from "@/lib/server/testimonials";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Depoimentos de quem usou",
  description: "Leia o que as pessoas dizem depois de criar o currículo no CurriculosPRO.",
  alternates: { canonical: "/depoimentos" },
};

export default async function TestimonialsPage() {
  const { items, stats } = await getTestimonials(120);
  return (
    <main className="lp tm-page">
      <SiteHeader />
      <section className="wrap tm-head">
        <div>
          <h1>O que dizem as pessoas que criaram o currículo aqui</h1>
          <p>Depoimentos reais enviados pelos usuários e publicados com autorização.</p>
        </div>
        {stats.total > 0 && (
          <div className="tm-score">
            <strong>
              {stats.average.toLocaleString("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}
            </strong>
            <Stars value={stats.average} />
            <span>
              {stats.total} {stats.total === 1 ? "avaliação publicada" : "avaliações publicadas"}
            </span>
          </div>
        )}
      </section>
      <section className="wrap">
        {items.length ? (
          <div className="tm-grid">
            {items.map((item) => (
              <TestimonialCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="tm-empty">
            <h2>Seja a primeira pessoa a deixar um depoimento</h2>
            <p>
              Criou seu currículo por aqui? Conte como foi — seu relato ajuda quem está procurando emprego.
            </p>
          </div>
        )}
        <div className="tm-cta">
          <div>
            <b>Já usou o CurriculosPRO?</b>
            <span>Deixe sua avaliação. Leva menos de um minuto.</span>
          </div>
          <Link className="btn btn-primary" href="/feedback">
            Avaliar o site
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
