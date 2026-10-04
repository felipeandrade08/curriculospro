import Image from "next/image";
import Link from "next/link";

export function SiteFooter(){
 return <footer className="siteFooter"><div className="shell footer">
  <div className="footerBrand"><Link className="brand brandImage footerLogo" href="/"><Image src="/brand/logo-transparent.png" alt="CurriculosPRO" width={165} height={62}/></Link><p>Currículos profissionais, simples de criar e prontos para novas oportunidades.</p><div className="footerTrust"><span>Conta gratuita</span><span>PDF profissional</span><span>Controle dos seus dados</span></div></div>
  <div className="footerLinks"><strong>PRODUTO</strong><Link href="/modelos">Modelos</Link><Link href="/curriculos">Meus currículos</Link><Link href="/editor?new=blank">Criar currículo</Link></div>
  <div className="footerLinks"><strong>CONTA</strong><Link href="/auth/sign-in">Entrar</Link><Link href="/auth/sign-up">Criar conta grátis</Link><Link href="/curriculos">Sincronização</Link></div>
  <div className="footerLinks"><strong>LEGAL</strong><Link href="/privacidade">Privacidade</Link><Link href="/termos">Termos de uso</Link></div><div className="footerMeta"><span>© 2026 CurriculosPRO</span><small>Desenvolvido por <strong>Felipe Andrade Dev</strong></small><small>Feito para ajudar você a apresentar sua trajetória com clareza.</small></div>
 </div></footer>
}