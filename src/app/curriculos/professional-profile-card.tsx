"use client";
import {useEffect,useState} from "react";
import {PROFESSIONAL_PROFILE_KEY,ProfessionalProfile,ResumeDocument,emptyProfessionalProfile,isProfessionalProfile,profileFromResume} from "@/lib/resume";

export function ProfessionalProfileCard({resumes}:{resumes:ResumeDocument[]}){
 const [profile,setProfile]=useState<ProfessionalProfile|null>(null);
 useEffect(()=>{try{const raw=localStorage.getItem(PROFESSIONAL_PROFILE_KEY);if(raw){const parsed=JSON.parse(raw);if(isProfessionalProfile(parsed))setProfile(parsed)}}catch{}},[]);
 const save=(next:ProfessionalProfile)=>{setProfile(next);localStorage.setItem(PROFESSIONAL_PROFILE_KEY,JSON.stringify(next))};
 const create=()=>{save(emptyProfessionalProfile());location.href="/perfil-profissional"};
 const importResume=()=>{if(!resumes.length)return;const labels=resumes.map((x,i)=>`${i+1}. ${x.title}`).join("\n"),answer=prompt("Qual currículo deseja usar como ponto de partida?\n\n"+labels,"1"),index=Number(answer)-1;if(Number.isInteger(index)&&resumes[index]){if(profile&&!confirm("Substituir os dados atuais do Perfil Profissional pelos dados deste currículo?"))return;save(profileFromResume(resumes[index]))}};
 const count=profile?(profile.experiences.length+profile.education.length+profile.courses.filter(Boolean).length+profile.skills.filter(Boolean).length+profile.languages.filter(Boolean).length):0;
 const checks=profile?[!!profile.name.trim()||!!profile.email.trim()||!!profile.phone.trim(),profile.experiences.some(x=>x.title.trim()||x.description.trim()),profile.education.some(x=>x.title.trim()),profile.skills.some(Boolean),profile.courses.some(Boolean),profile.languages.some(Boolean)]:[];
 const completed=checks.filter(Boolean).length,progress=profile?Math.round(completed/6*100):0;
 return <section className="professionalProfileCard"><div className="profileIdentity"><span>PF</span><div><small>SEU BANCO DE INFORMAÇÕES PROFISSIONAIS</small><strong>{profile?(profile.name||"Seu perfil-base"):"Crie sua base profissional"}</strong><p>{profile?"Reaproveite sua trajetória em diferentes currículos, escolhendo o que faz sentido para cada vaga.":"Cadastre sua trajetória uma vez e aproveite as informações em vários currículos."}</p></div></div>{profile?<div className="profileStats"><b>{progress}%</b><span>do perfil preenchido</span><div className="profileProgressTrack"><i style={{width:progress+"%"}}/></div><small>{completed} de 6 áreas com informações · {count} itens cadastrados</small></div>:<div className="profileStats"><b>1×</b><span>preencha e reutilize</span><small>Sem alterar seus currículos existentes</small></div>}<div className="profileActions">{profile?<a className="cardPrimary" href="/perfil-profissional">Completar / editar perfil</a>:<button className="cardPrimary" onClick={create}>Montar meu Perfil Profissional</button>}<button onClick={importResume} disabled={!resumes.length}>Começar com um currículo existente</button><a href="/adaptar-vaga">Comparar com uma vaga →</a></div></section>
}
