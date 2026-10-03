export type ResumeTemplate="essential"|"modern"|"executive";
export type ResumeDensity="comfortable"|"compact";
export type ResumeSection="summary"|"experiences"|"education"|"skills"|"languages"|"courses";
export type ResumeItem={id:string;title:string;subtitle:string;period:string;description:string};
export type ResumeData={name:string;role:string;email:string;phone:string;city:string;summary:string;photo:string;experiences:ResumeItem[];education:ResumeItem[];courses:string[];skills:string[];languages:string[]};
export type ResumeDocument={id:string;title:string;createdAt:string;updatedAt:string;cv:ResumeData;template:ResumeTemplate;accent:string;density:ResumeDensity;sectionOrder:ResumeSection[];hidden:ResumeSection[]};
export const RESUME_LIBRARY_KEY="curriculospro.resumes.v3";
export const ACTIVE_RESUME_KEY="curriculospro.activeResume.v3";
export const LEGACY_RESUME_KEY="curriculospro.cv.v2";
export const defaultOrder:ResumeSection[]=["summary","experiences","education","skills","languages","courses"];
export const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
export const emptyResumeData=():ResumeData=>({name:"",photo:"",role:"",email:"",phone:"",city:"",summary:"",experiences:[],education:[],courses:[],skills:[],languages:[]});
export const exampleResumeData=():ResumeData=>({name:"Mariana Costa",photo:"",role:"Analista de Marketing",email:"mariana@email.com",phone:"(11) 99999-9999",city:"São Paulo, SP",summary:"Profissional de marketing com experiência em planejamento de campanhas, conteúdo e análise de resultados.",experiences:[{id:uid(),title:"Analista de Marketing",subtitle:"Empresa Exemplo",period:"2024 — Atual",description:"Planejamento e acompanhamento de campanhas digitais, produção de conteúdo e análise de indicadores."}],education:[{id:uid(),title:"Marketing",subtitle:"Instituição de Ensino",period:"2021 — 2023",description:""}],courses:["Marketing Digital"],skills:["Planejamento","Conteúdo","Análise de dados"],languages:["Português — Nativo"]});
export function createResume(mode:"blank"|"example"="blank",template:ResumeTemplate="essential"):ResumeDocument{const now=new Date().toISOString();return{id:uid(),title:mode==="example"?"Currículo de exemplo":"Meu currículo",createdAt:now,updatedAt:now,cv:mode==="example"?exampleResumeData():emptyResumeData(),template,accent:"#087cf0",density:"comfortable",sectionOrder:[...defaultOrder],hidden:[]}}
