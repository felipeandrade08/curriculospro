"use client";
import Image from "next/image";
import Link from "next/link";
import {authClient} from "@/lib/auth/client";

export function SiteHeader({active}:{active?:"modelos"|"curriculos"}){
 const {data:session,isPending}=authClient.useSession();
 const user=session?.user;
 const displayName=user?.name?.trim()||user?.email?.split("@")[0]||"Minha conta";
 const initial=displayName.charAt(0).toLocaleUpperCase("pt-BR");
 return <header className="siteHeader"><div className="nav shell">
  <Link className="brand brandImage" href="/"><Image src="/brand/logo-transparent.png" alt="CurriculosPRO" width={190} height={72} priority/></Link>
  <nav aria-label="Navegação principal">
   <Link href="/#recursos">Recursos</Link>
   <Link className={active==="modelos"?"active":""} href="/modelos">Modelos</Link>
   <Link className={active==="curriculos"?"active":""} href="/curriculos">Meus currículos</Link>
   {!isPending&&!user&&<><Link className="navLogin" href="/auth/sign-in">Entrar</Link><Link href="/auth/sign-up" className="navCta">Criar conta grátis</Link></>}
   {!isPending&&user&&<Link href="/curriculos" className="navAccount" aria-label={"Conta de "+displayName}><span>{initial}</span><span className="navAccountText"><small>CONTA CONECTADA</small><b>{displayName}</b></span></Link>}
   {isPending&&<span className="navSessionLoading" aria-label="Carregando sessão"/>}
  </nav>
 </div></header>
}