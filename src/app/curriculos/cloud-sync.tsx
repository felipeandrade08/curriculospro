"use client";
import {useState} from "react";
import {authClient} from "@/lib/auth/client";
import {RESUME_LIBRARY_KEY,ResumeDocument} from "@/lib/resume";
const REVISIONS="curriculospro.cloudRevisions.v1";
export function CloudSync(){
 const session=authClient.useSession(),[status,setStatus]=useState(""),[busy,setBusy]=useState(false);
 const sync=async()=>{setBusy(true);setStatus("Sincronizando…");try{
  const local:ResumeDocument[]=JSON.parse(localStorage.getItem(RESUME_LIBRARY_KEY)||"[]"),revisions:Record<string,number>=JSON.parse(localStorage.getItem(REVISIONS)||"{}");
  let conflicts=0,saved=0;
  for(const doc of local){const res=await fetch("/api/resumes/"+encodeURIComponent(doc.id),{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({...doc,revision:revisions[doc.id]||0})});if(res.status===409){conflicts++;continue}if(!res.ok)throw new Error("sync");const data=await res.json();revisions[doc.id]=data.revision;saved++}
  localStorage.setItem(REVISIONS,JSON.stringify(revisions));setStatus(conflicts?saved+" salvos · "+conflicts+" conflito(s) preservado(s)":saved+" currículo(s) sincronizado(s)");
 }catch{setStatus("Não foi possível sincronizar agora.")}finally{setBusy(false)}};
 if(session.isPending)return null;
 if(!session.data)return <a className="cloudLogin" href="/auth/sign-in">Entrar para salvar na nuvem</a>;
 return <div className="cloudSync"><span>☁ {session.data.user.email}</span><button disabled={busy} onClick={sync}>{busy?"Sincronizando…":"Sincronizar agora"}</button><button className="cloudSignout" onClick={()=>authClient.signOut()}>Sair</button>{status&&<small>{status}</small>}</div>
}
