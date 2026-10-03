"use client";
import Link from "next/link";
import {FormEvent,useState} from "react";
import {useRouter} from "next/navigation";
import {authClient} from "@/lib/auth/client";

export function CurriculosAuthForm({mode}:{mode:"sign-in"|"sign-up"}){
 const creating=mode==="sign-up",router=useRouter();
 const [busy,setBusy]=useState(false),[error,setError]=useState("");
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setError("");
  const data=new FormData(event.currentTarget),email=String(data.get("email")||""),password=String(data.get("password")||"");
  try{
   const result=creating
    ?await authClient.signUp.email({name:String(data.get("name")||""),email,password})
    :await authClient.signIn.email({email,password});
   if(result.error){setError(result.error.message||"Não foi possível continuar. Verifique os dados informados.");return}
   router.push("/curriculos");router.refresh();
  }catch{setError("Não foi possível conectar à sua conta agora. Tente novamente.")}
  finally{setBusy(false)}
 }
 return <form className="cpAuthForm" onSubmit={submit}>
  <div className="cpAuthTitle"><h2>{creating?"Criar sua conta":"Entrar no CurriculosPRO"}</h2><p>{creating?"Leva menos de um minuto.":"Use seu e-mail e senha para continuar."}</p></div>
  {creating&&<label>Nome completo<input name="name" autoComplete="name" required placeholder="Como devemos chamar você?" /></label>}
  <label>E-mail<input name="email" type="email" autoComplete="email" required placeholder="voce@exemplo.com" /></label>
  <label>Senha<div className="cpPasswordRow">{!creating&&<Link href="/auth/forgot-password">Esqueci minha senha</Link>}</div><input name="password" type="password" minLength={8} autoComplete={creating?"new-password":"current-password"} required placeholder={creating?"Crie uma senha segura":"Digite sua senha"} /></label>
  {error&&<div className="cpAuthError" role="alert">{error}</div>}
  <button type="submit" disabled={busy}>{busy?"Aguarde…":creating?"Criar conta grátis":"Entrar na minha conta"}</button>
  <p className="cpAuthSwitch">{creating?"Já tem uma conta?":"Ainda não tem uma conta?"} <Link href={creating?"/auth/sign-in":"/auth/sign-up"}>{creating?"Entrar":"Criar conta grátis"}</Link></p>
 </form>
}
