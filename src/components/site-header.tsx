import Image from "next/image";
import Link from "next/link";

export function SiteHeader({active}:{active?:"modelos"|"curriculos"}){
 return <header className="siteHeader"><div className="nav shell">
  <Link className="brand brandImage" href="/"><Image src="/brand/logo-transparent.png" alt="CurriculosPRO" width={190} height={72} priority/></Link>
  <nav aria-label="Navegação principal">
   <Link href="/#recursos">Recursos</Link>
   <Link className={active==="modelos"?"active":""} href="/modelos">Modelos</Link>
   <Link className={active==="curriculos"?"active":""} href="/curriculos">Meus currículos</Link>
   <Link className="navLogin" href="/auth/sign-in">Entrar</Link>
   <Link href="/auth/sign-up" className="navCta">Criar conta grátis</Link>
  </nav>
 </div></header>
}
