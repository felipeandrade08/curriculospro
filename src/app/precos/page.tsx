import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { UsageBeacon } from "@/components/usage-beacon";
import { ACCESS_DAYS, ACCESS_LIST_PRICE_LABEL, ACCESS_PLANS, ACCESS_PRICE_LABEL, KIT_NAME, KIT_PRICE_LABEL, MONTH_PRICE_LABEL, PROMO_PERCENT, SERVICE_PRICE_LABEL, SERVICE_SUPPORT_DAYS, UPGRADE_PRICE_LABEL } from "@/lib/billing";
import { SUPPORT_WHATSAPP_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Preços",
  description: `Crie e edite seu currículo grátis. Baixe em PDF sem marca d'água por ${ACCESS_PRICE_LABEL} com ${ACCESS_DAYS} dias de downloads ilimitados. Ou o Kit Emprego, com 30 dias e todas as ferramentas para conseguir a vaga, por ${MONTH_PRICE_LABEL}. Pagamento único via Pix ou cartão.`,
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
    q: "Como funciona o “Fazemos para você”?",
    a: `Você paga ${SERVICE_PRICE_LABEL}, envia o currículo antigo ou conta onde trabalhou (pelo site ou pelo WhatsApp) e nossa equipe monta seu currículo em até 24 horas. Você recebe em PDF e Word e tem ${SERVICE_SUPPORT_DAYS} dias de suporte para pedir ajustes.`,
  },
  {
    q: "É uma assinatura?",
    a: `Não. Você paga uma única vez: ${ACCESS_PRICE_LABEL} pelo pacote Currículo (${ACCESS_DAYS} dias) ou ${MONTH_PRICE_LABEL} pelo ${KIT_NAME} (${ACCESS_PLANS.mes.days} dias). Não existe renovação automática nem cobrança recorrente.`,
  },
  {
    q: "Qual a diferença entre o Currículo e o Kit Emprego?",
    a: `O Currículo libera o PDF, o Word e a carta de apresentação por ${ACCESS_DAYS} dias. O ${KIT_NAME} inclui tudo isso por ${ACCESS_PLANS.mes.days} dias e libera as ferramentas para conseguir a vaga: adaptar o currículo a cada vaga, LinkedIn pronto, respostas para a candidatura, dados prontos para Gupy, Indeed e Infojobs, e correção das respostas da entrevista. Quem já comprou o Currículo pode completar pagando só ${UPGRADE_PRICE_LABEL}.`,
  },
  {
    q: "Como funciona o pagamento?",
    a: "Por Pix ou cartão de crédito e débito, processados pelo Mercado Pago. No Pix, você escaneia o QR Code ou usa o copia e cola no app do seu banco. No cartão, você paga na página segura do Mercado Pago. O download é liberado automaticamente assim que o pagamento é confirmado.",
  },
  {
    q: "Posso editar e baixar de novo?",
    a: `Sim. Durante os ${ACCESS_DAYS} dias você pode ajustar seus currículos para cada vaga e baixar quantas vezes quiser, de qualquer currículo da sua conta.`,
  },
  {
    q: "O que acontece quando o acesso termina?",
    a: "Seus currículos continuam salvos e você pode seguir editando gratuitamente. Quando precisar baixar novamente, é só liberar um novo período.",
  },
  {
    q: "Tenho um cupom de desconto. Onde uso?",
    a: "Na hora de pagar, toque em “Tenho um cupom de desconto”, digite o código e toque em Aplicar. O valor com desconto aparece antes de você pagar.",
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

      <section className="pricingPlans three shell" aria-label="Pacotes">
        <article className="pricingPlan">
          <header>
            <h2>Grátis</h2>
            <strong>R$ 0</strong>
            <span>para sempre</span>
          </header>
          <ul>
            <li>Editor guiado completo, com todos os modelos</li>
            <li>Prévia em tempo real com marca d&apos;água</li>
            <li>Teste do robô e nota de compatibilidade com a vaga</li>
            <li>Passo a passo dos sites de vagas e controle de candidaturas</li>
            <li>Perguntas de entrevista e mensagens para enviar o currículo</li>
          </ul>
          <Link href="/comecar" className="btn btn-ghost btn-lg">
            Começar grátis
          </Link>
        </article>
        <article className="pricingPlan">
          <header>
            <h2>Currículo</h2>
            <span className="promo-tag">{PROMO_PERCENT}% OFF · promoção</span>
            <s className="promo-was">{ACCESS_LIST_PRICE_LABEL}</s>
            <strong>{ACCESS_PRICE_LABEL}</strong>
            <span>{ACCESS_DAYS} dias de acesso · pagamento único</span>
          </header>
          <ul>
            <li>Tudo do plano grátis</li>
            <li>
              <b>PDF sem marca d&apos;água</b> e versão em <b>Word</b>
            </li>
            <li>
              <b>Downloads ilimitados</b> por {ACCESS_DAYS} dias, ajustando para cada vaga
            </li>
            <li>
              <b>Carta de apresentação</b> montada a partir do currículo
            </li>
            <li>Seus currículos salvos na nuvem</li>
          </ul>
          <Link href="/comecar" className="btn btn-ghost btn-lg">
            Criar meu currículo
          </Link>
          <small>Você só paga na hora de baixar.</small>
        </article>
        <article className="pricingPlan featured">
          <header>
            <h2>{KIT_NAME}</h2>
            <strong>{KIT_PRICE_LABEL}</strong>
            <span>{ACCESS_PLANS.mes.days} dias de acesso · pagamento único</span>
          </header>
          <ul>
            <li>
              Tudo do pacote Currículo, por <b>{ACCESS_PLANS.mes.days} dias</b>
            </li>
            <li>
              <b>Adapte o currículo para cada vaga</b>, com dicas e itens adicionados com um toque
            </li>
            <li>
              <b>LinkedIn pronto</b>: título, Sobre, experiências e competências
            </li>
            <li>
              <b>Respostas prontas</b> para as perguntas da candidatura
            </li>
            <li>
              <b>Gupy, Indeed e Infojobs</b>: seus dados prontos para colar
            </li>
            <li>
              <b>Entrevista</b>: dicas de todas as perguntas e correção das suas respostas
            </li>
          </ul>
          <Link href="/comecar" className="btn btn-primary btn-lg">
            Criar meu currículo
          </Link>
          <small>Já comprou o Currículo? Complete pelo Kit pagando só {UPGRADE_PRICE_LABEL}.</small>
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

      <section className="pricingService shell" aria-labelledby="serviceTitle">
        <div>
          <span className="pricingServiceTag">Fazemos para você</span>
          <h2 id="serviceTitle">Prefere que a gente faça? Seu currículo pronto por {SERVICE_PRICE_LABEL}</h2>
          <ul>
            <li>
              Nossa equipe monta seu currículo em <b>até 24 horas</b>
            </li>
            <li>
              Você manda o currículo antigo ou conta onde trabalhou, <b>pelo site ou pelo WhatsApp</b>
            </li>
            <li>
              Recebe em <b>PDF e Word</b>, por link no WhatsApp e por e-mail
            </li>
            <li>
              <b>{SERVICE_SUPPORT_DAYS} dias de suporte</b> para pedir ajustes
            </li>
          </ul>
        </div>
        <div className="pricingServiceCta">
          <strong>{SERVICE_PRICE_LABEL}</strong>
          <span>pagamento único · sem mensalidade</span>
          <Link href="/feito-para-voce" className="btn btn-primary btn-lg">
            Quero que façam o meu
          </Link>
          <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            <WhatsappLogo size={18} weight="fill" aria-hidden="true" /> Ou peça pelo WhatsApp
          </a>
        </div>
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
            <WhatsappLogo size={18} weight="fill" aria-hidden="true" /> Fale com a gente pelo WhatsApp
          </a>
          .
        </p>
      </section>
      <SiteFooter />
    </main>
  );
}
