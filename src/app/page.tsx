import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ResumeThumb } from "@/components/resume-view";
import { ACCESS_DAYS, ACCESS_PRICE_LABEL } from "@/lib/billing";
import { EXAMPLE_CATEGORIES, RESUME_EXAMPLES, exampleById, type ResumeExample } from "@/lib/examples";
import { TEMPLATES } from "@/lib/templates";
import { defaultOrder, type ResumeData } from "@/lib/resume";

export const metadata: Metadata = {
  title: "CurriculosPRO — Crie seu currículo profissional online",
  description: `Monte um currículo profissional em minutos com 10 modelos e 20 exemplos por profissão. Edite grátis e baixe o PDF por ${ACCESS_PRICE_LABEL}.`,
  alternates: { canonical: "/" },
};

const toData = (example: ResumeExample): ResumeData => ({
  ...example.data,
  photo: "",
  experiences: example.data.experiences.map((x, i) => ({ ...x, id: example.id + "-e" + i })),
  education: example.data.education.map((x, i) => ({ ...x, id: example.id + "-d" + i })),
});

function Thumb({ example, width, template }: { example: ResumeExample; width: number; template?: string }) {
  const t = TEMPLATES.find((x) => x.id === template);
  return (
    <ResumeThumb
      width={width}
      cv={toData(example)}
      template={t ? t.id : example.template}
      accent={t ? t.accent : example.accent}
      density="comfortable"
      sections={defaultOrder}
    />
  );
}

const featured = [
  "first-job",
  "retail",
  "administrative",
  "logistics",
  "nursing-tech",
  "technology",
  "cashier",
  "marketing",
]
  .map((id) => exampleById(id))
  .filter((x): x is ResumeExample => !!x);

export default function Home() {
  const hrBase = exampleById("hr")!;
  // Versão mais completa do exemplo para a vitrine do topo.
  const hr: ResumeExample = {
    ...hrBase,
    data: {
      ...hrBase.data,
      experiences: [
        ...hrBase.data.experiences.map((x, i) =>
          i === 1
            ? {
                ...x,
                description:
                  "• Admissões, controle de ponto e apoio na folha de pagamento de 300 colaboradores\n• Organização de treinamentos obrigatórios e controle de exames periódicos",
              }
            : x,
        ),
        {
          title: "Estagiária de Recursos Humanos",
          subtitle: "Hospital Pequeno Príncipe",
          period: "2018 — 2019",
          description:
            "• Triagem de currículos, agendamento de entrevistas e apoio em ações de endomarketing",
        },
      ],
      courses: [...hrBase.data.courses, "FGV — Gestão de Pessoas — 30h"],
    },
  };
  const logistics = exampleById("logistics")!;
  const teacher = exampleById("teacher")!;
  const gallerySample = exampleById("customer-service")!;

  return (
    <main className="lp">
      <SiteHeader />

      <section className="lp-hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <h1>Um currículo que dá vontade de ler até o fim.</h1>
            <p className="hero-lead">
              Escolha um modelo, preencha com a ajuda do editor e baixe um PDF limpo, em uma página, pronto
              para mandar para o recrutador.
            </p>
            <div className="hero-actions">
              <Link href="/editor?new=blank" className="btn btn-primary btn-lg">
                Criar meu currículo
              </Link>
              <Link href="/exemplos" className="btn btn-ghost btn-lg">
                Ver exemplos por profissão
              </Link>
            </div>
            <ul className="hero-facts">
              <li>Comece sem cadastro</li>
              <li>Edite quantas vezes quiser</li>
              <li>Pague {ACCESS_PRICE_LABEL} só para baixar</li>
            </ul>
          </div>
          <div className="hero-stack" aria-hidden="true">
            <div className="hero-paper hero-paper-back1">
              <Thumb example={logistics} width={300} />
            </div>
            <div className="hero-paper hero-paper-back2">
              <Thumb example={teacher} width={300} />
            </div>
            <div className="hero-paper hero-paper-front marked">
              <Thumb example={hr} width={420} />
              <span className="hero-note">
                <b>1 página</b>
                PDF pronto para enviar
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="band band-models" aria-labelledby="models-title">
        <div className="wrap">
          <div className="band-head">
            <div>
              <h2 id="models-title">10 modelos, do clássico ao criativo</h2>
              <p>Troque de modelo a qualquer momento: o conteúdo continua o mesmo, só a apresentação muda.</p>
            </div>
            <Link href="/modelos" className="btn btn-ghost">
              Ver todos os modelos
            </Link>
          </div>
        </div>
        <div className="models-rail" tabIndex={0} aria-label="Modelos de currículo">
          {TEMPLATES.map((t) => (
            <Link
              key={t.id}
              href={"/editor?new=example&example=" + gallerySample.id + "&template=" + t.id}
              className="rail-item"
            >
              <Thumb example={gallerySample} width={210} template={t.id} />
              <span className="rail-name">{t.name}</span>
              <span className="rail-tag">{t.tag}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="wrap examples" aria-labelledby="examples-title">
        <div className="band-head">
          <div>
            <h2 id="examples-title">Comece pelo exemplo da sua profissão</h2>
            <p>
              Currículos completos escritos para cada área. Troque pelos seus dados e ajuste o que for
              diferente na sua história.
            </p>
          </div>
        </div>
        <div className="chip-row">
          {EXAMPLE_CATEGORIES.map((c) => (
            <Link key={c} href={"/exemplos?area=" + encodeURIComponent(c)} className="chip">
              {c}
            </Link>
          ))}
        </div>
        <div className="example-grid">
          {featured.map((ex) => (
            <Link key={ex.id} href={"/exemplos/" + ex.id} className="example-card">
              <div className="example-paper">
                <Thumb example={ex} width={236} />
              </div>
              <span className="example-title">{ex.title}</span>
              <span className="example-cat">{ex.category}</span>
            </Link>
          ))}
        </div>
        <p className="examples-more">
          <Link href="/exemplos">Ver os {RESUME_EXAMPLES.length} exemplos</Link>
        </p>
      </section>

      <section className="steps-band" aria-labelledby="steps-title">
        <div className="wrap">
          <h2 id="steps-title">Do zero ao PDF em três passos</h2>
          <ol className="steps">
            <li>
              <h3>Escolha um ponto de partida</h3>
              <p>Comece em branco, por um exemplo da sua área ou importando o currículo que você já tem.</p>
            </li>
            <li>
              <h3>Preencha com orientação</h3>
              <p>
                O editor sugere objetivos, atividades e competências por área e avisa o que ainda falta. Você
                vê o resultado em tempo real.
              </p>
            </li>
            <li>
              <h3>Baixe e envie</h3>
              <p>
                Libere o download com um Pix de {ACCESS_PRICE_LABEL} e baixe quantas vezes quiser durante{" "}
                {ACCESS_DAYS} dias.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <section className="wrap lp-features" aria-labelledby="features-title">
        <div className="features-copy">
          <h2 id="features-title">Feito para quem não tem tempo a perder</h2>
          <dl className="feature-list">
            <div>
              <dt>Cabe em uma página</dt>
              <dd>A prévia avisa quando o currículo passa de uma folha e ajusta o texto com um clique.</dd>
            </div>
            <div>
              <dt>Sugestões por área</dt>
              <dd>
                Frases prontas de objetivo, atividades e competências para você adaptar à sua realidade.
              </dd>
            </div>
            <div>
              <dt>Uma versão para cada vaga</dt>
              <dd>Guarde sua trajetória no Perfil Profissional e monte versões diferentes sem redigitar.</dd>
            </div>
            <div>
              <dt>Nada inventado</dt>
              <dd>
                O CurriculosPRO organiza o que você conta. Nenhuma experiência ou habilidade é inventada no
                seu lugar.
              </dd>
            </div>
          </dl>
        </div>
        <div className="features-visual" aria-hidden="true">
          <div className="fv-bar">
            <i />
            Cabe em 1 página
          </div>
          <Thumb example={exampleById("finance")!} width={360} />
        </div>
      </section>

      <section className="price-band" aria-labelledby="price-title">
        <div className="wrap price-grid">
          <div>
            <h2 id="price-title">Grátis para criar. {ACCESS_PRICE_LABEL} para baixar.</h2>
            <p>
              Sem assinatura e sem renovação automática. Um Pix libera {ACCESS_DAYS} dias de downloads
              ilimitados de todos os seus currículos: ajuste para cada vaga e baixe de novo sem pagar outra
              vez.
            </p>
            <Link href="/precos" className="price-link">
              Como funciona o pagamento
            </Link>
          </div>
          <div className="price-card">
            <div className="price-amount">
              <strong>{ACCESS_PRICE_LABEL}</strong>
              <span>pagamento único via Pix</span>
            </div>
            <ul>
              <li>PDF sem marca d&apos;água</li>
              <li>Downloads ilimitados por {ACCESS_DAYS} dias</li>
              <li>Todos os modelos e currículos da conta</li>
              <li>Liberação automática em segundos</li>
            </ul>
            <Link href="/editor?new=blank" className="btn btn-primary btn-lg">
              Criar meu currículo
            </Link>
          </div>
        </div>
      </section>

      <section className="wrap closing">
        <h2>Seu próximo emprego começa com uma boa primeira impressão.</h2>
        <div className="hero-actions">
          <Link href="/editor?new=blank" className="btn btn-primary btn-lg">
            Criar meu currículo
          </Link>
          <Link href="/importar" className="btn btn-ghost btn-lg">
            Importar currículo antigo
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
