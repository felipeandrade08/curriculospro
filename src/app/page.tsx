import Link from "next/link";
import {SiteHeader} from "@/components/site-header";
import {SiteFooter} from "@/components/site-footer";

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section className="heroBrand">
        <div className="hero shell">
          <div className="heroCopy">
            <div className="pill">✦ Simples, rápido e profissional</div>
            <h1>Seu currículo merece <em>abrir portas.</em></h1>
            <p>Crie um currículo profissional em poucos minutos, com design moderno e uma experiência feita para você se destacar.</p>
            <div className="actions">
              <Link href="/editor?new=blank" className="primary">Criar meu currículo grátis <b>→</b></Link>
              <Link href="/modelos" className="secondary">Ver modelos</Link>
            </div>
            <small>✓ Sem cartão &nbsp; ✓ Fácil de editar &nbsp; ✓ Pronto para PDF</small>
          </div>
          <div className="heroVisual" aria-hidden="true" />
        </div>
      </section>

      <section className="trustStrip shell"><span>GRÁTIS PARA COMEÇAR</span><b>Crie sem cartão</b><b>Edite quando quiser</b><b>Exporte em PDF</b><b>Conta opcional com nuvem</b></section>

      <section id="recursos" className="features shell">
        <div><span>01</span><h3>Preencha sem complicação</h3><p>Um editor organizado que guia você por cada parte do currículo.</p></div>
        <div><span>02</span><h3>Veja enquanto cria</h3><p>Acompanhe o resultado em tempo real e ajuste tudo com confiança.</p></div>
        <div><span>03</span><h3>Baixe e envie</h3><p>Seu currículo profissional preparado para imprimir e compartilhar.</p></div>
      </section>

      <section className="homeSectionIntro shell"><span>UMA EXPERIÊNCIA COMPLETA</span><h2>Do primeiro campo ao PDF final.</h2><p>Uma jornada simples para transformar suas informações em uma apresentação profissional.</p></section>
      <section className="productProof shell">
        <div className="proofCopy"><span>FEITO PARA SER SIMPLES</span><h2>Você escreve. O CurriculosPRO organiza.</h2><p>Preencha suas informações em um editor guiado, acompanhe o currículo em tempo real e escolha a apresentação que combina com seu objetivo.</p><div className="proofPoints"><div><b>01</b><span><strong>Edite com segurança</strong><small>Suas alterações ficam salvas enquanto você trabalha.</small></span></div><div><b>02</b><span><strong>Veja antes de baixar</strong><small>O preview mostra exatamente a estrutura do currículo.</small></span></div><div><b>03</b><span><strong>Leve em PDF</strong><small>Finalize e salve uma versão pronta para compartilhar.</small></span></div></div></div>
        <div className="proofWindow" aria-label="Prévia ilustrativa do editor CurriculosPRO"><div className="proofWindowBar"><i/><i/><i/><span>CurriculosPRO · Editor</span></div><div className="proofWindowBody"><aside><b>Conteúdo</b><span/><span/><span/><span/></aside><div className="proofPaper"><strong>SEU NOME</strong><em>Título profissional</em><hr/><b>PERFIL PROFISSIONAL</b><p/><p/><b>EXPERIÊNCIA</b><p/><p/></div></div></div>
      </section>
      <section className="privacyBand"><div className="shell"><div><span>PRIVACIDADE E CONTROLE</span><h2>Seu currículo continua sendo seu.</h2></div><p>Você pode começar sem criar conta. No navegador, seus currículos ficam disponíveis neste dispositivo; ao usar uma conta, você pode utilizar os recursos de sincronização em nuvem.</p><Link href="/curriculos">Ver meus currículos →</Link></div></section>

      <section id="modelos" className="statement shell">
        <div className="pill">DESIGN QUE TRABALHA POR VOCÊ</div>
        <h2>Bonito para quem vê.<br/><em>Prático para quem cria.</em></h2>
        <p>Começamos com modelos limpos e profissionais. Você cuida da sua história; o CurriculosPRO cuida da apresentação.</p>
        <Link href="/modelos" className="primary">Escolher meu modelo →</Link>
      </section>

      <section className="finalCta shell"><span>PRONTO PARA COMEÇAR?</span><h2>Transforme suas informações em um currículo que você tenha orgulho de enviar.</h2><p>Comece gratuitamente. Você pode editar, testar modelos e preparar seu PDF no seu ritmo.</p><div><Link className="primary" href="/editor?new=blank">Criar meu currículo grátis →</Link><Link className="secondary" href="/modelos">Conhecer os modelos</Link></div></section>

      <SiteFooter />
    </main>
  );
}
