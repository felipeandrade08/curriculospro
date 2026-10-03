import Image from "next/image";
import Link from "next/link";
import {AuthView} from "@neondatabase/auth-ui";
import {authViewPaths} from "@neondatabase/auth-ui/server";

export const dynamicParams=false;
export function generateStaticParams(){return Object.values(authViewPaths).map(path=>({path}))}

export default async function AuthPage({params}:{params:Promise<{path:string}>}){
 const {path}=await params;
 const creating=path==="sign-up";
 return <main className="authPage">
  <section className="authBrand">
   <Link className="authLogo" href="/"><Image src="/brand/logo-transparent.png" alt="CurriculosPRO" width={220} height={84} priority /></Link>
   <span className="authEyebrow">SUA CARREIRA, ORGANIZADA</span>
   <h1>{creating?"Crie sua conta. Seus currículos vão com você.":"Bem-vindo de volta."}</h1>
   <p>{creating?"Salve seus currículos na nuvem, continue de onde parou e mantenha suas versões profissionais em um só lugar.":"Acesse seus currículos salvos e continue preparando sua próxima oportunidade."}</p>
   <div className="authBenefits"><span>✓ Conta gratuita</span><span>✓ Currículos sincronizados</span><span>✓ Seus dados sob seu controle</span></div>
   <Link className="authBack" href="/">← Voltar para o CurriculosPRO</Link>
  </section>
  <section className="authPanel">
   <div className="authPanelIntro"><span>{creating?"CRIAR CONTA":"ACESSAR CONTA"}</span><strong>{creating?"Comece gratuitamente":"Entre na sua conta"}</strong></div>
   <div className="authCard"><AuthView path={path}/></div>
   <small className="authPrivacy">Ao continuar, você concorda em usar seus dados apenas para os recursos da sua conta e currículos.</small>
  </section>
 </main>
}
