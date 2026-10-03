import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <header className="nav shell">
        <Link className="brand brandImage" href="/">
          <Image src="/brand/logo-transparent.png" alt="CurriculosPRO" width={190} height={72} priority />
        </Link>
        <nav>
          <a href="#recursos">Recursos</a>
          <Link href="/modelos">Modelos</Link><Link href="/curriculos">Meus currículos</Link>
          <Link href="/editor" className="navCta">Criar currículo grátis</Link>
        </nav>
      </header>

      <section className="heroBrand">
        <div className="hero shell">
          <div className="heroCopy">
            <div className="pill">✦ Simples, rápido e profissional</div>
            <h1>Seu currículo merece <em>abrir portas.</em></h1>
            <p>Crie um currículo profissional em poucos minutos, com design moderno e uma experiência feita para você se destacar.</p>
            <div className="actions">
              <Link href="/editor" className="primary">Criar meu currículo grátis <b>→</b></Link>
              <Link href="/modelos" className="secondary">Ver modelos</Link>
            </div>
            <small>✓ Sem cartão &nbsp; ✓ Fácil de editar &nbsp; ✓ Pronto para PDF</small>
          </div>
          <div className="heroVisual" aria-hidden="true" />
        </div>
      </section>

      <section id="recursos" className="features shell">
        <div><span>01</span><h3>Preencha sem complicação</h3><p>Um editor organizado que guia você por cada parte do currículo.</p></div>
        <div><span>02</span><h3>Veja enquanto cria</h3><p>Acompanhe o resultado em tempo real e ajuste tudo com confiança.</p></div>
        <div><span>03</span><h3>Baixe e envie</h3><p>Seu currículo profissional preparado para imprimir e compartilhar.</p></div>
      </section>

      <section id="modelos" className="statement shell">
        <div className="pill">DESIGN QUE TRABALHA POR VOCÊ</div>
        <h2>Bonito para quem vê.<br/><em>Prático para quem cria.</em></h2>
        <p>Começamos com modelos limpos e profissionais. Você cuida da sua história; o CurriculosPRO cuida da apresentação.</p>
        <Link href="/modelos" className="primary">Escolher meu modelo →</Link>
      </section>

      <footer>
        <div className="shell footer">
          <div className="brand brandImage footerLogo">
            <Image src="/brand/logo-transparent.png" alt="CurriculosPRO" width={165} height={62} />
          </div>
          <p>Feito com dedicação por <strong>Felipe Andrade Dev</strong></p>
          <small>© 2026 CurriculosPRO</small>
        </div>
      </footer>
    </main>
  );
}
