"use client";
import {useEffect,useState} from "react";
import {PROFESSIONAL_PROFILE_KEY,ProfessionalProfile,ResumeDocument,emptyProfessionalProfile,isProfessionalProfile,profileFromResume} from "@/lib/resume";

export function ProfessionalProfileCard({resumes}:{resumes:ResumeDocument[]}){
 const [profile,setProfile]=useState<ProfessionalProfile|null>(null);
 useEffect(()=>{try{const raw=localStorage.getItem(PROFESSIONAL_PROFILE_KEY);if(raw){const parsed=JSON.parse(raw);if(isProfessionalProfile(parsed))setProfile(parsed)}}catch{}},[]);
 const save=(next:ProfessionalProfile)=>{setProfile(next);localStorage.setItem(PROFESSIONAL_PROFILE_KEY,JSON.stringify(next))};
 const create=()=>save(emptyProfessionalProfile());
 const importResume=()=>{if(!resumes.length)return;const labels=resumes.map((x,i)=>`${i+1}. ${x.title}`).join("\n"),answer=prompt("Qual currículo deseja usar como ponto de partida?\n\n"+labels,"1"),index=Number(answer)-1;if(Number.isInteger(index)&&resumes[index]){if(profile&&!confirm("Substituir os dados atuais do Perfil Profissional pelos dados deste currículo?"))return;save(profileFromResume(resumes[index]))}};
 const count=profile?(profile.experiences.length+profile.education.length+profile.courses.filter(Boolean).length+profile.skills.filter(Boolean).length+profile.languages.filter(Boolean).length):0;
 return <section className="professionalProfileCard"><div className="profileIdentity"><span>PF</span><div><small>PERFIL PROFISSIONAL</small><strong>{profile?(profile.name||"Seu perfil-base"):"Crie sua base profissional"}</strong><p>{profile?"Uma fonte reutilizável para montar diferentes versões de currículo.":"Cadastre sua trajetória uma vez e reaproveite informações verdadeiras em novos currículos."}</p></div></div>{profile?<div className="profileStats"><b>{count}</b><span>informações reutilizáveis</span><small>Atualizado {new Date(profile.updatedAt).toLocaleDateString("pt-BR")}</small></div>:<div className="profileStats"><b>1×</b><span>cadastro-base</span><small>Sem alterar seus currículos existentes</small></div>}<div className="profileActions">{profile?<a className="cardPrimary" href="/perfil-profissional">Editar perfil</a>:<button className="cardPrimary" onClick={create}>Criar perfil</button>}<button onClick={importResume} disabled={!resumes.length}>{profile?"Atualizar a partir de um currículo":"Começar com um currículo"}</button></div></section>
}
