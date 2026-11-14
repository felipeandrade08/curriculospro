import type { Metadata } from "next";
import Link from "next/link";
import { ACCESS_DAYS, ACCESS_PRICE_LABEL } from "@/lib/billing";

export const metadata: Metadata = { alternates: { canonical: "/" } };
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section className="heroBrand">
        <div className="hero shell">
          <div className="heroCopy">
            <div className="pill">✦ Simples, rápido e profissional</div>
            <h1>
              Seu currículo merece <em>abrir portas.</em>
            </h1>
            <p>
              Crie um currículo profissional em poucos minutos, com design moderno e uma experiência feita
              para você se destacar.
            </p>
            <div className="actions">
              <Link href="/editor?new=blank" className="primary">
                Criar meu currículo <b>→</b>
              </Link>
              <Link href="/modelos" className="secondary">
                Ver modelos
              </Link>
              <Link href="/importar" className="secondary">
                Importar currículo antigo
              </Link>
            </div>
            <small>✓ Comece sem cadastro &nbsp; ✓ Edite grátis &nbsp; ✓ PDF por {ACCESS_PRICE_LABEL}</small>
          </div>
          <div className="heroVisual" aria-hidden="true" />
        </div>
      </section>

      <section className="trustStrip shell">
        <span>CRIE GRÁTIS</span>
        <b>Sem cadastro obrigatório</b>
        <b>Edite quando quiser</b>
        <b>Exporte em PDF</b>
        <b>Conta opcional com nuvem</b>
      </section>

      <section className="profileSpotlight shell">
        <div className="profileSpotlightCopy">
          <span className="profileSpotlightEyebrow">SEU PONTO DE PARTIDA</span>
          <h2>
            Conte sua trajetória uma vez. <em>Use em várias oportunidades.</em>
          </h2>
          <p>
            Monte seu Perfil Profissional com experiências, formação, cursos e competências reais. Depois,
            escolha o que aproveitar em cada currículo — sem sobrescrever suas versões.
          </p>
          <div className="profileSpotlightActions">
            <Link href="/perfil-profissional" className="primary">
              Conhecer meu Perfil Profissional →
            </Link>
            <Link href="/adaptar-vaga" className="secondary">
              Adaptar para uma vaga
            </Link>
          </div>
          <small>
            Disponível sem cadastro. Com uma conta, seus currículos e seu acesso ficam salvos em qualquer
            dispositivo.
          </small>
        </div>
        <div className="profileSpotlightSteps">
          <div>
            <b>01</b>
            <span>
              <strong>Organize sua base</strong>
              <small>Registre informações profissionais verdadeiras.</small>
            </span>
          </div>
          <div>
            <b>02</b>
            <span>
              <strong>Escolha o que destacar</strong>
              <small>Selecione conteúdo adequado para cada oportunidade.</small>
            </span>
          </div>
          <div>
            <b>03</b>
            <span>
              <strong>Crie versões independentes</strong>
              <small>Personalize e exporte cada currículo em PDF.</small>
            </span>
          </div>
        </div>
      </section>

      <section className="importSpotlight shell">
        <div>
          <span>JÁ TEM UM CURRÍCULO?</span>
          <h2>Não comece do zero.</h2>
          <p>
            Traga seu currículo atual, confira as informações que identificamos e continue editando em um novo
            documento — sem perder suas versões anteriores.
          </p>
        </div>
        <Link href="/importar" className="primary">
          Importar meu currículo →
        </Link>
      </section>

      <section id="recursos" className="features shell">
        <div>
          <span>01</span>
          <h3>Preencha sem complicação</h3>
          <p>Um editor guiado organiza cada etapa e ajuda você a não esquecer informações importantes.</p>
        </div>
        <div>
          <span>02</span>
          <h3>Receba orientações úteis</h3>
          <p>Sugestões de objetivos, competências e atividades para adaptar à sua experiência real.</p>
        </div>
        <div>
          <span>03</span>
          <h3>Personalize com liberdade</h3>
          <p>Escolha modelos, cores, ordem das seções e o conteúdo que deseja apresentar.</p>
        </div>
        <div>
          <span>04</span>
          <h3>Revise e exporte em PDF</h3>
          <p>Confira a prévia, receba alertas de preenchimento e prepare seu currículo para compartilhar.</p>
        </div>
      </section>

      <section className="homeSectionIntro shell">
        <span>UMA EXPERIÊNCIA COMPLETA</span>
        <h2>Do primeiro campo ao PDF final.</h2>
        <p>Uma jornada simples para transformar suas informações em uma apresentação profissional.</p>
      </section>
      <section className="productProof shell">
        <div className="proofCopy">
          <span>FEITO PARA SER SIMPLES</span>
          <h2>Você escreve. O CurriculosPRO organiza.</h2>
          <p>
            Preencha suas informações em um editor guiado, acompanhe o currículo em tempo real e escolha a
            apresentação que combina com seu objetivo.
          </p>
          <div className="proofPoints">
            <div>
              <b>01</b>
              <span>
                <strong>Edite com segurança</strong>
                <small>Suas alterações ficam salvas enquanto você trabalha.</small>
              </span>
            </div>
            <div>
              <b>02</b>
              <span>
                <strong>Veja antes de baixar</strong>
                <small>O preview mostra exatamente a estrutura do currículo.</small>
              </span>
            </div>
            <div>
              <b>03</b>
              <span>
                <strong>Leve em PDF</strong>
                <small>Finalize e salve uma versão pronta para compartilhar.</small>
              </span>
            </div>
          </div>
        </div>
        <div className="proofWindow" aria-label="Prévia ilustrativa do editor CurriculosPRO">
          <div className="proofWindowBar">
            <i />
            <i />
            <i />
            <span>CurriculosPRO · Editor</span>
          </div>
          <div className="proofWindowBody">
            <aside>
              <b>Conteúdo</b>
              <span />
              <span />
              <span />
              <span />
            </aside>
            <div className="proofPaper">
              <strong>SEU NOME</strong>
              <em>Título profissional</em>
              <hr />
              <b>PERFIL PROFISSIONAL</b>
              <p />
              <p />
              <b>EXPERIÊNCIA</b>
              <p />
              <p />
            </div>
          </div>
        </div>
      </section>
      <section className="privacyBand">
        <div className="shell">
          <div>
            <span>PRIVACIDADE E CONTROLE</span>
            <h2>Seu currículo continua sendo seu.</h2>
          </div>
          <p>
            Você pode começar sem criar conta. No navegador, seus currículos ficam disponíveis neste
            dispositivo; ao usar uma conta, você pode utilizar os recursos de sincronização em nuvem.
          </p>
          <Link href="/curriculos">Ver meus currículos →</Link>
        </div>
      </section>

      <section id="modelos" className="statement shell">
        <div className="pill">DESIGN QUE TRABALHA POR VOCÊ</div>
        <h2>
          Bonito para quem vê.
          <br />
          <em>Prático para quem cria.</em>
        </h2>
        <p>
          Começamos com modelos limpos e profissionais. Você cuida da sua história; o CurriculosPRO cuida da
          apresentação.
        </p>
        <Link href="/modelos" className="primary">
          Escolher meu modelo →
        </Link>
      </section>

      <section className="pricingTeaser shell" aria-labelledby="pricingTeaserTitle">
        <div className="pricingTeaserCopy">
          <span>PREÇO JUSTO E TRANSPARENTE</span>
          <h2 id="pricingTeaserTitle">Crie de graça. Pague só quando for baixar.</h2>
          <p>
            Monte, revise e personalize seu currículo sem pagar nada. Para baixar o PDF sem marca d&apos;água,
            libere {ACCESS_DAYS} dias de acesso com um único Pix. Sem assinatura, sem renovação automática.
          </p>
          <Link href="/precos" className="secondary">
            Ver como funciona →
          </Link>
        </div>
        <div className="pricingTeaserCard">
          <small>ACESSO DE {ACCESS_DAYS} DIAS</small>
          <strong>{ACCESS_PRICE_LABEL}</strong>
          <span>pagamento único via Pix</span>
          <ul>
            <li>Downloads ilimitados em PDF</li>
            <li>Todos os modelos e cores</li>
            <li>Ajustes para cada vaga sem pagar de novo</li>
          </ul>
          <Link href="/editor?new=blank" className="primary">
            Começar meu currículo →
          </Link>
        </div>
      </section>

      <section className="finalCta shell">
        <span>PRONTO PARA COMEÇAR?</span>
        <h2>Transforme suas informações em um currículo que você tenha orgulho de enviar.</h2>
        <p>
          Comece agora, sem cadastro. Quando estiver pronto, libere o download em PDF por {ACCESS_PRICE_LABEL}{" "}
          e baixe quantas vezes quiser durante {ACCESS_DAYS} dias.
        </p>
        <div>
          <Link className="primary" href="/editor?new=blank">
            Criar meu currículo →
          </Link>
          <Link className="secondary" href="/modelos">
            Conhecer os modelos
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
