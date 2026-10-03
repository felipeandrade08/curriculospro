"use client";
import {useState} from "react";
import {authClient} from "@/lib/auth/client";
import {RESUME_LIBRARY_KEY,ResumeDocument,cloneResume,isResumeDocument} from "@/lib/resume";
const REVISIONS="curriculospro.cloudRevisions.v1";
type CloudResume={document:ResumeDocument;revision:number;updatedAt:string};
type Conflict={local:ResumeDocument;remote:CloudResume};

function readLocal(){try{const raw=JSON.parse(localStorage.getItem(RESUME_LIBRARY_KEY)||"[]");return Array.isArray(raw)?raw.filter(isResumeDocument):[]}catch{return[]}}
function writeLocal(items:ResumeDocument[]){localStorage.setItem(RESUME_LIBRARY_KEY,JSON.stringify(items));window.dispatchEvent(new Event("curriculospro:library-changed"))}

export function CloudSync(){
 const session=authClient.useSession(),[status,setStatus]=useState(""),[busy,setBusy]=useState(false),[conflicts,setConflicts]=useState<Conflict[]>([]);
 const userId=session.data?.user.id||session.data?.user.email||"anonymous",key=REVISIONS+":"+userId;
 const resolve=(conflict:Conflict,choice:"local-copy"|"remote")=>{
  const items=readLocal();
  if(choice==="remote")writeLocal(items.map(x=>x.id===conflict.local.id?conflict.remote.document:x));
  else writeLocal([cloneResume(conflict.local,conflict.local.title+" — versão local"),...items.map(x=>x.id===conflict.local.id?conflict.remote.document:x)]);
  const revisions:Record<string,number>=JSON.parse(localStorage.getItem(key)||"{}");revisions[conflict.remote.document.id]=conflict.remote.revision;localStorage.setItem(key,JSON.stringify(revisions));
  setConflicts(list=>list.filter(x=>x.local.id!==conflict.local.id));setStatus(choice==="remote"?"Versão da nuvem aplicada.":"As duas versões foram preservadas na biblioteca.");
 };
 const sync=async()=>{setBusy(true);setStatus("Comparando dispositivo e nuvem…");setConflicts([]);try{
  let local=readLocal();const revisions:Record<string,number>=JSON.parse(localStorage.getItem(key)||"{}");
  const cloudRes=await fetch("/api/resumes",{cache:"no-store"});if(!cloudRes.ok)throw new Error("cloud");
  const cloudData=await cloudRes.json() as {resumes?:CloudResume[]},remote=(cloudData.resumes||[]).filter(x=>isResumeDocument(x.document));
  const localIds=new Set(local.map(x=>x.id)),downloaded=remote.filter(x=>!localIds.has(x.document.id));
  if(downloaded.length){local=[...downloaded.map(x=>x.document),...local];writeLocal(local);for(const x of downloaded)revisions[x.document.id]=x.revision}
  const remoteById=new Map(remote.map(x=>[x.document.id,x])),found:Conflict[]=[];let saved=0;
  for(const doc of local){
   const known=Number(revisions[doc.id]||0),cloud=remoteById.get(doc.id);
   if(cloud&&known&&cloud.revision!==known){found.push({local:doc,remote:cloud});continue}
   const res=await fetch("/api/resumes/"+encodeURIComponent(doc.id),{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({...doc,revision:known})});
   if(res.status===409){const data=await res.json();if(data.remote)found.push({local:doc,remote:data.remote});continue}
   if(!res.ok)throw new Error("sync");const data=await res.json();revisions[doc.id]=data.revision;saved++;
  }
  localStorage.setItem(key,JSON.stringify(revisions));setConflicts(found);
  setStatus(found.length?downloaded.length+" baixado(s) · "+saved+" sincronizado(s) · "+found.length+" conflito(s) aguardando decisão":downloaded.length+" baixado(s) · "+saved+" sincronizado(s) · tudo atualizado");
 }catch{setStatus("Não foi possível sincronizar agora. Seus currículos locais foram preservados.")}finally{setBusy(false)}};
 if(session.isPending)return <div className="accountCard accountLoading"><span className="statusDot"/>Verificando sua conta…</div>;
 if(!session.data)return <div className="accountCard signedOut"><div className="accountIcon">☁</div><div><small>NUVEM OPCIONAL</small><strong>Salve também na sua conta</strong><p>Entre para sincronizar seus currículos sem perder as cópias deste dispositivo.</p></div><a className="cloudLogin" href="/auth/sign-in">Entrar na conta →</a></div>;
 const user=session.data.user,initials=(user.name||user.email||"CP").split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase();
 return <div className="accountCard signedIn">
  <div className="accountIdentity"><span className="accountAvatar">{initials}</span><div><small>CONTA CONECTADA</small><strong>{user.name||"Sua conta CurriculosPRO"}</strong><p>{user.email}</p></div></div>
  <div className="accountPlan"><small>PLANO ATUAL</small><b>FREE</b><span>Nuvem incluída</span></div>
  <div className="accountCloud"><small>SINCRONIZAÇÃO</small><b><i className={busy?"syncDot busy":"syncDot"}/>{busy?"Sincronizando…":"Nuvem disponível"}</b><span>Local + conta</span></div>
  <div className="accountActions"><button disabled={busy} onClick={sync}>{busy?"Sincronizando…":"Sincronizar agora"}</button><button className="cloudSignout" onClick={()=>authClient.signOut()}>Sair</button></div>
  {status&&<div className="syncMessage" role="status">{status}</div>}
  {conflicts.length>0&&<div className="conflictCenter"><div className="conflictIntro"><b>Conflitos encontrados</b><span>Nada foi sobrescrito. Escolha o que fazer com cada currículo.</span></div>{conflicts.map(c=><div className="conflictItem" key={c.local.id}><div><strong>{c.local.title}</strong><small>Local: {new Date(c.local.updatedAt).toLocaleString("pt-BR")} · Nuvem: {new Date(c.remote.updatedAt).toLocaleString("pt-BR")}</small></div><div><button onClick={()=>resolve(c,"local-copy")}>Preservar as duas</button><button className="conflictRemote" onClick={()=>resolve(c,"remote")}>Usar versão da nuvem</button></div></div>)}</div>}
 </div>
}