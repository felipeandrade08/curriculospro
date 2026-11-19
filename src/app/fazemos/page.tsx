import type { Metadata } from "next";
import Link from "next/link";
import { ResumeThumb } from "@/components/resume-view";
import { Stars } from "@/components/testimonials";
import { SiteFooter } from "@/components/site-footer";
import { getTestimonials } from "@/lib/server/testimonials";
import { exampleById } from "@/lib/examples";
import { defaultOrder, type ResumeData } from "@/lib/resume";
import { ACCESS_PRICE_LABEL, SERVICE_PRICE_LABEL, SERVICE_SUPPORT_DAYS } from "@/lib/billing";
import { LandingBeacon, WhatsappCta } from "./wa-cta";
import "./fazemos.css";

export const revalidate = 300;

export const metadata: Metadata = {
  title: `A gente faz seu currículo por ${SERVICE_PRICE_LABEL}`,
  description: `Mande uma foto do currículo antigo ou conte suas experiências no WhatsApp. Entregamos em PDF e Word, com ${SERVICE_SUPPORT_DAYS} dias para ajustes.`,
  alternates: { canonical: "/fazemos" },
};

function sample(): ResumeData | null {
  const ex = exampleById("retail");
  if (!ex) return null;
  return {
    ...ex.data,
    photo: "",
    experiences: ex.data.experiences.map((x, i) => ({ ...x, id: "fz-e" + i })),
    education: ex.data.education.map((x, i) => ({ ...x, id: "fz-d" + i })),
  };
}

const steps = [
  {
    title: "Chame no WhatsApp",
    text: "Mande uma foto do currículo antigo ou escreva onde já trabalhou, o que fazia e a vaga que procura.",
  },
  {
    title: `Pague ${SERVICE_PRICE_LABEL} no Pix`,
    text: "A gente manda o código Pix ali mesmo na conversa. Sem cadastro e sem cartão.",
  },
  {
    title: "Receba o currículo pronto",
    text: "Chega um link no seu WhatsApp para baixar em PDF e Word e já enviar para as vagas.",
  },
];

const faq = [
  {
    q: "Não tenho currículo nenhum. Dá para fazer?",
    a: "Dá. Conte no WhatsApp os lugares onde trabalhou (mesmo bico ou trabalho sem registro), até que série estudou e a vaga que quer. A gente organiza tudo.",
  },
  {
    q: "Em quanto tempo fica pronto?",
    a: "Na maioria das vezes no mesmo dia, e no máximo em 24 horas depois do pagamento.",
  },
  {
    q: "E se eu quiser mudar alguma coisa?",
    a: `Você tem ${SERVICE_SUPPORT_DAYS} dias para pedir ajustes pelo mesmo WhatsApp, sem pagar de novo.`,
  },
  {
    q: "Chamei de madrugada. E agora?",
    a: "Pode mandar mesmo assim. Deixe a foto do currículo antigo ou suas experiências na conversa que a gente começa assim que responder.",
  },
];

export default async function AdLandingPage() {
  const cv = sample();
  const { items, stats } = await getTestimonials(12);
  const reviews = items.filter((t) => t.rating >= 4 && t.message.length > 20).slice(0, 3);

  return (
    <main className="fz">
      <LandingBeacon />
      <header className="fz-top">
        <Link href="/" className="fz-logo" aria-label="CurriculosPRO, página inicial">
          <img src="/brand/logo-transparent.png" alt="CurriculosPRO" />
        </Link>
      </header>

      <section className="fz-hero">
        <div className="fz-hero-text">
          <h1>A gente faz seu currículo por {SERVICE_PRICE_LABEL}</h1>
          <p className="fz-lead">
            Você só manda as informações pelo WhatsApp. Entregamos pronto em PDF e Word, com {SERVICE_SUPPORT_DAYS} dias
            para pedir ajustes.
          </p>
          <div className="fz-actions">
            <WhatsappCta className="fz-wa" />
            <Link href="/feito-para-voce" className="fz-site">
              Prefiro pedir pelo site
            </Link>
          </div>
          {stats.total > 0 && (
            <p className="fz-rating">
              <Stars value={stats.average} />
              <span>
                {stats.average.toLocaleString("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 })} de
                nota em {stats.total} {stats.total === 1 ? "avaliação" : "avaliações"}
              </span>
            </p>
          )}
        </div>

        <div className="fz-demo" aria-hidden="true">
          <div className="fz-chat">
            <p className="fz-msg in">Oi! Quero que vocês façam meu currículo 🙏</p>
            <p className="fz-msg in fz-photo">
              <span>📷 foto do currículo antigo</span>
            </p>
            <p className="fz-msg out">Recebido! Já estamos montando, te mandamos o link hoje ✅</p>
          </div>
          {cv && (
            <div className="fz-sheet">
              <ResumeThumb
                width={230}
                cv={cv}
                template="modern"
                accent="#1553d6"
                density="comfortable"
                sections={defaultOrder}
              />
            </div>
          )}
        </div>
      </section>

      <section className="fz-band">
        <div className="fz-wrap">
          <h2>Como funciona</h2>
          <ol className="fz-steps">
            {steps.map((s) => (
              <li key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="fz-wrap fz-what">
        <h2>O que você pode mandar</h2>
        <ul>
          <li>Foto ou PDF do currículo antigo, mesmo desatualizado</li>
          <li>Um texto contando onde trabalhou e por quanto tempo</li>
          <li>Seu LinkedIn, se tiver</li>
          <li>A vaga que você quer, para a gente caprichar no que importa</li>
        </ul>
      </section>

      {reviews.length > 0 && (
        <section className="fz-wrap fz-reviews">
          <h2>Quem já pediu</h2>
          <div className="fz-review-list">
            {reviews.map((t) => (
              <figure key={t.id}>
                <Stars value={t.rating} />
                <blockquote>{t.message}</blockquote>
                <figcaption>
                  {t.authorName}
                  {t.authorRole ? ", " + t.authorRole : ""}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className="fz-wrap fz-faq">
        <h2>Dúvidas comuns</h2>
        {faq.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
        <p className="fz-diy">
          Prefere montar sozinho? <Link href="/comecar">Use nosso editor</Link> e baixe por {ACCESS_PRICE_LABEL}.
        </p>
      </section>

      <section className="fz-close">
        <h2>Seu currículo novo começa com uma mensagem</h2>
        <WhatsappCta className="fz-wa" />
      </section>

      <SiteFooter />

      <div className="fz-sticky">
        <WhatsappCta className="fz-wa">Quero meu currículo por {SERVICE_PRICE_LABEL}</WhatsappCta>
      </div>
    </main>
  );
}
