"use client";
import {useState} from "react";
import {authClient} from "@/lib/auth/client";
import {RESUME_LIBRARY_KEY,ResumeDocument} from "@/lib/resume";
const REVISIONS="curriculospro.cloudRevisions.v1";

export function CloudSync(){
 const session=authClient.useSession(),[status,setStatus]=useState(""),[busy,setBusy]=useState(false);
 const sync=async()=>{setBusy(true);setStatus("Sincronizando com a nuvem…");try{
  const local:ResumeDocument[]=JSON.parse(localStorage.getItem(RESUME_LIBRARY_KEY)||"[]");
  const userId=session.data?.user.id||session.data?.user.email||"anonymous",key=REVISIONS+":"+userId;
  const revisions:Record<string,number>=JSON.parse(localStorage.getItem(key)||"{}");
  let conflicts=0,saved=0;
  for(const doc of local){const res=await fetch("/api/resumes/"+encodeURIComponent(doc.id),{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({...doc,revision:revisions[doc.id]||0})});if(res.status===409){conflicts++;continue}if(!res.ok)throw new Error("sync");const data=await res.json();revisions[doc.id]=data.revision;saved++}
  localStorage.setItem(key,JSON.stringify(revisions));setStatus(conflicts?saved+" sincronizado(s) · "+conflicts+" conflito(s) preservado(s)":saved+" currículo(s) sincronizado(s) com segurança");
 }catch{setStatus("Não foi possível sincronizar agora. Seus currículos locais foram preservados.")}finally{setBusy(false)}};
 if(session.isPending)return <div className="accountCard accountLoading"><span className="statusDot"/>Verificando sua conta…</div>;
 if(!session.data)return <div className="accountCard signedOut"><div className="accountIcon">☁</div><div><small>NUVEM OPCIONAL</small><strong>Salve também na sua conta</strong><p>Entre para sincronizar seus currículos sem perder as cópias deste dispositivo.</p></div><a className="cloudLogin" href="/auth/sign-in">Entrar na conta →</a></div>;
 const user=session.data.user;
 const initials=(user.name||user.email||"CP").split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase();
 return <div className="accountCard signedIn">
  <div className="accountIdentity"><span className="accountAvatar">{initials}</span><div><small>CONTA CONECTADA</small><strong>{user.name||"Sua conta CurriculosPRO"}</strong><p>{user.email}</p></div></div>
  <div className="accountPlan"><small>PLANO ATUAL</small><b>FREE</b><span>Recursos essenciais liberados</span></div>
  <div className="accountCloud"><small>SINCRONIZAÇÃO</small><b><i className={busy?"syncDot busy":"syncDot"}/>{busy?"Sincronizando…":"Nuvem disponível"}</b><span>Local + conta</span></div>
  <div className="accountActions"><button disabled={busy} onClick={sync}>{busy?"Sincronizando…":"Sincronizar agora"}</button><button className="cloudSignout" onClick={()=>authClient.signOut()}>Sair</button></div>
  {status&&<div className="syncMessage" role="status">{status}</div>}
 </div>
}