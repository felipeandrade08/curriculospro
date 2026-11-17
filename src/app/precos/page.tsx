import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { UsageBeacon } from "@/components/usage-beacon";
import { ACCESS_DAYS, ACCESS_PRICE_LABEL } from "@/lib/billing";
import { SUPPORT_WHATSAPP_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Preços",
  description: `Crie e edite seu currículo grátis. Baixe em PDF sem marca d'água por ${ACCESS_PRICE_LABEL} com ${ACCESS_DAYS} dias de downloads ilimitados. Pagamento único via Pix.`,
  alternates: { canonical: "/precos" },
};

const rows: [string, boolean, boolean][] = [
  ["Criar e editar currículos", true, true],
  ["Todos os modelos, cores e layouts", true, true],
  ["Prévia em tempo real", true, true],
  ["Importar currículo antigo", true, true],
  ["Perfil Profissional e adaptação para vagas", true, true],
  ["Download em PDF sem marca d'água", false, true],
  [`Downloads ilimitados por ${ACCESS_DAYS} dias`, false, true],
  ["Carta de apresentação em PDF", false, true],
  ["Currículo em Word (.docx)", false, true],
  ["Currículo feito pela nossa equipe em até 24h", false, true],
];

const faq = [
  {
    q: "É uma assinatura?",
    a: `Não. Você paga ${ACCESS_PRICE_LABEL} uma única vez e tem ${ACCESS_DAYS} dias de acesso. Não existe renovação automática nem cobrança recorrente.`,
  },
  {
    q: "Como funciona o pagamento?",
    a: "O pagamento é feito por Pix, processado pelo Mercado Pago. Você escaneia o QR Code ou usa o copia e cola no app do seu banco, e o download é liberado automaticamente em poucos segundos após a confirmação.",
  },
  {
    q: "Posso editar e baixar de novo?",
    a: `Sim. Durante os ${ACCESS_DAYS} dias você pode ajustar seus currículos para cada vaga e baixar quantas vezes quiser, de qualquer currículo da sua conta.`,
  },
  {
    q: `O que acontece depois dos ${ACCESS_DAYS} dias?`,
    a: "Seus currículos continuam salvos e você pode seguir editando gratuitamente. Quando precisar baixar novamente, é só liberar um novo período.",
  },
  {
    q: "Preciso criar uma conta?",
    a: "Para criar e editar, não. Para pagar, sim: a conta guarda o seu acesso e permite usar seus currículos em qualquer dispositivo. Nada do que você já escreveu é perdido ao criar a conta.",
  },
  {
    q: "O PDF funciona em sistemas de recrutamento?",
    a: "O PDF é gerado com texto real e selecionável, em formato A4, o que facilita a leitura por recrutadores e por sistemas de triagem de candidaturas.",
  },
  {
    q: "E se eu tiver algum problema?",
    a: "Fale com a gente pelo WhatsApp. Se o pagamento não liberar o download ou você se arrepender da compra, você pode pedir o reembolso em até 7 dias.",
  },
];

export default function PricingPage() {
  return (
    <main className="pricingPage lp">
      <UsageBeacon event="pricing_view" />
      <SiteHeader active="precos" />
      <section className="pricingHero shell">
        <h1>Crie de graça. Pague só quando for baixar.</h1>
        <p>
          Monte seu currículo com calma, teste modelos e ajuste cada detalhe sem pagar nada. Quando estiver
          pronto, libere o PDF com um único Pix.
        </p>
      </section>

      <section className="pricingPlans shell" aria-label="Planos">
        <article className="pricingPlan">
          <header>
            <h2>Grátis</h2>
            <strong>R$ 0</strong>
            <span>para sempre</span>
          </header>
          <ul>
            <li>Editor guiado completo</li>
            <li>Todos os modelos e cores</li>
            <li>Prévia em tempo real com marca d&apos;água</li>
            <li>Salvo no seu navegador, sem cadastro</li>
          </ul>
          <Link href="/comecar" className="btn btn-ghost btn-lg">
            Começar grátis
          </Link>
        </article>
        <article className="pricingPlan featured">
          <header>
            <h2>Acesso {ACCESS_DAYS} dias</h2>
            <strong>{ACCESS_PRICE_LABEL}</strong>
            <span>pagamento único via Pix</span>
          </header>
          <ul>
            <li>Tudo do plano grátis</li>
            <li>
              <b>PDF sem marca d&apos;água</b>, pronto para enviar
            </li>
            <li>
              <b>Downloads ilimitados</b> por {ACCESS_DAYS} dias
            </li>
            <li>Ajuste para cada vaga e baixe de novo sem pagar outra vez</li>
            <li>
              <b>Carta de apresentação</b> em PDF, montada a partir do currículo
            </li>
            <li>
              Versão em <b>Word (.docx)</b> para sites de vagas que pedem esse formato
            </li>
            <li>
              Se preferir, <b>nossa equipe faz o currículo</b> para você em até 24 horas
            </li>
            <li>Seus currículos salvos na nuvem</li>
            <li>Sem assinatura e sem renovação automática</li>
          </ul>
          <Link href="/comecar" className="btn btn-primary btn-lg">
            Criar meu currículo
          </Link>
          <small>Você só paga na hora de baixar.</small>
        </article>
      </section>

      <section className="pricingCompare shell" aria-labelledby="compareTitle">
        <h2 id="compareTitle">O que está incluído</h2>
        <div className="pricingTable" role="table">
          <div className="pricingRow head" role="row">
            <span role="columnheader">Recurso</span>
            <span role="columnheader">Grátis</span>
            <span role="columnheader">{ACCESS_DAYS} dias</span>
          </div>
          {rows.map(([label, free, paid]) => (
            <div className="pricingRow" role="row" key={label}>
              <span role="cell">{label}</span>
              <span
                role="cell"
                className={free ? "yes" : "no"}
                aria-label={free ? "Incluído" : "Não incluído"}
              >
                {free ? "✓" : "—"}
              </span>
              <span
                role="cell"
                className={paid ? "yes" : "no"}
                aria-label={paid ? "Incluído" : "Não incluído"}
              >
                {paid ? "✓" : "—"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="pricingSteps shell" aria-labelledby="stepsTitle">
        <h2 id="stepsTitle">Como funciona</h2>
        <ol>
          <li>
            <b>01</b>
            <strong>Crie e revise</strong>
            <span>Preencha com o editor guiado e escolha o modelo ideal. Tudo grátis.</span>
          </li>
          <li>
            <b>02</b>
            <strong>Pague com Pix</strong>
            <span>Na hora de baixar, gere o Pix de {ACCESS_PRICE_LABEL}. A liberação é automática.</span>
          </li>
          <li>
            <b>03</b>
            <strong>Baixe à vontade</strong>
            <span>Por {ACCESS_DAYS} dias, baixe e atualize seus currículos quantas vezes precisar.</span>
          </li>
        </ol>
      </section>

      <section className="pricingFaq shell" aria-labelledby="faqTitle">
        <h2 id="faqTitle">Perguntas frequentes</h2>
        {faq.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
        <p className="pricingHelp">
          Ainda com dúvida?{" "}
          <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            Fale com a gente pelo WhatsApp
          </a>
          .
        </p>
      </section>
      <SiteFooter />
    </main>
  );
}
