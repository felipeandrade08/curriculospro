import Image from "next/image";
import Link from "next/link";

const linkedinUrl = "https://www.linkedin.com/in/felipe-andrade-0331b9205/";

export function SiteFooter(){
 return <footer className="siteFooter">
  <div className="shell footer">
   <div className="footerBrand">
    <Link className="brand brandImage footerLogo" href="/" aria-label="CurriculosPRO — página inicial">
     <Image src="/brand/logo-transparent.png" alt="CurriculosPRO" width={165} height={62}/>
    </Link>
    <p>Uma ferramenta gratuita para transformar sua trajetória em um currículo claro, organizado e profissional.</p>
    <div className="footerTrust"><span>Gratuito para criar</span><span>Sem cadastro obrigatório</span><span>PDF pronto para compartilhar</span></div>
   </div>
   <nav className="footerLinks" aria-label="Navegação do produto">
    <strong>PRODUTO</strong><Link href="/modelos">Modelos de currículo</Link><Link href="/curriculos">Meus currículos</Link><Link href="/editor?new=blank">Criar currículo grátis</Link><Link href="/feedback">Enviar feedback</Link>
   </nav>
   <nav className="footerLinks" aria-label="Conta e recursos">
    <strong>SUA CONTA</strong><Link href="/auth/sign-in">Entrar</Link><Link href="/auth/sign-up">Criar conta grátis</Link><Link href="/curriculos">Sincronização em nuvem</Link>
   </nav>
   <nav className="footerLinks" aria-label="Informações do projeto">
    <strong>INFORMAÇÕES</strong><Link href="/apoie">Apoie o projeto</Link><Link href="/privacidade">Política de privacidade</Link><Link href="/termos">Termos de uso</Link>
   </nav>
   <div className="footerMeta">
    <span>© {new Date().getFullYear()} CurriculosPRO. Todos os direitos reservados.</span>
    <div className="footerCreator">
     <span>Desenvolvido por <strong>Felipe Andrade Dev</strong></span>
     <a className="footerSocial" href={linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="Visitar LinkedIn de Felipe Andrade (abre em nova aba)" title="LinkedIn — Felipe Andrade">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14ZM8.34 17.5V9.6H5.7v7.9h2.64ZM7.02 8.52a1.53 1.53 0 1 0 0-3.06 1.53 1.53 0 0 0 0 3.06ZM18.3 17.5v-4.33c0-2.32-1.24-3.4-2.9-3.4-1.34 0-1.94.74-2.27 1.26V9.6h-2.64v7.9h2.64v-3.92c0-1.03.2-2.02 1.47-2.02 1.25 0 1.27 1.17 1.27 2.09v3.85h2.43Z"/></svg>
      <span>LinkedIn</span>
     </a>
    </div>
    <small>Feito para ajudar você a apresentar sua história com clareza e confiança.</small>
   </div>
  </div>
 </footer>;
}
