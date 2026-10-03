import Image from "next/image";
import Link from "next/link";

export function SiteFooter(){
 return <footer className="siteFooter"><div className="shell footer">
  <div className="footerBrand"><Link className="brand brandImage footerLogo" href="/"><Image src="/brand/logo-transparent.png" alt="CurriculosPRO" width={165} height={62}/></Link><p>Currículos profissionais, simples de criar e prontos para novas oportunidades.</p></div>
  <div className="footerLinks"><strong>CurriculosPRO</strong><Link href="/modelos">Modelos</Link><Link href="/curriculos">Meus currículos</Link><Link href="/auth/sign-in">Entrar</Link></div>
  <div className="footerMeta"><span>© 2026 CurriculosPRO</span><small>Feito com dedicação por <strong>Felipe Andrade Dev</strong></small></div>
 </div></footer>
}
