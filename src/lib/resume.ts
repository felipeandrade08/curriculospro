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

export type PlanId="free"|"pro";
export type AccountMode="guest"|"account";
export type ProductAccess={plan:PlanId;accountMode:AccountMode};
export const PRODUCT_ACCESS_KEY="curriculospro.access.v1";
export const defaultAccess:ProductAccess={plan:"free",accountMode:"guest"};
export const features={multipleResumes:{free:true,pro:true},pdfExport:{free:true,pro:true},allCurrentTemplates:{free:true,pro:true},backup:{free:true,pro:true},cloudSync:{free:true,pro:true},aiRewrite:{free:false,pro:true},jobTailoring:{free:false,pro:true},coverLetter:{free:false,pro:true}} as const;
export type ResumeBackup={product:"CurriculosPRO";version:3;exportedAt:string;resumes:ResumeDocument[]};
export function isResumeDocument(x:unknown):x is ResumeDocument{if(!x||typeof x!=="object")return false;const d=x as Partial<ResumeDocument>;return typeof d.id==="string"&&typeof d.title==="string"&&!!d.cv&&typeof d.cv==="object"&&["essential","modern","executive"].includes(String(d.template))&&Array.isArray(d.sectionOrder)&&Array.isArray(d.hidden)}
export function parseBackup(value:string):ResumeDocument[]{const raw=JSON.parse(value) as Partial<ResumeBackup>;if(raw.product!=="CurriculosPRO"||raw.version!==3||!Array.isArray(raw.resumes))throw new Error("invalid-backup");const docs=raw.resumes.filter(isResumeDocument);if(!docs.length)throw new Error("empty-backup");return docs}
export function isResumeTemplate(value:string|null):value is ResumeTemplate{return value==="essential"||value==="modern"||value==="executive"}
export function cloneResume(source:ResumeDocument,title=source.title+" — cópia"):ResumeDocument{const now=new Date().toISOString();return{...source,id:uid(),title,createdAt:now,updatedAt:now,cv:{...source.cv,experiences:source.cv.experiences.map(x=>({...x,id:uid()})),education:source.cv.education.map(x=>({...x,id:uid()})),courses:[...source.cv.courses],skills:[...source.cv.skills],languages:[...source.cv.languages]},sectionOrder:[...source.sectionOrder],hidden:[...source.hidden]}}
export function safeFilename(value:string){return (value||"curriculo").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9-_ ]/g,"").trim().replace(/\s+/g,"-").toLowerCase().slice(0,70)||"curriculo"}

export const RECOVERY_KEY="curriculospro.recovery.v1";
export type RecoverySnapshot={createdAt:string;reason:"delete"|"import"|"manual";resumes:ResumeDocument[]};
export type SyncStatus="local"|"pending"|"synced"|"error";
export type SyncEnvelope={documentId:string;updatedAt:string;revision:number;deviceId:string};
export type AccountProfile={id:string;email:string;displayName:string;plan:PlanId};
export function createRecovery(resumes:ResumeDocument[],reason:RecoverySnapshot["reason"]):RecoverySnapshot{return{createdAt:new Date().toISOString(),reason,resumes:JSON.parse(JSON.stringify(resumes)) as ResumeDocument[]}}
export function readRecovery():RecoverySnapshot|null{try{const raw=localStorage.getItem(RECOVERY_KEY);return raw?JSON.parse(raw) as RecoverySnapshot:null}catch{return null}}
export function storeRecovery(resumes:ResumeDocument[],reason:RecoverySnapshot["reason"]){try{localStorage.setItem(RECOVERY_KEY,JSON.stringify(createRecovery(resumes,reason)))}catch{}}

export function migrateLegacyResume(value:string):ResumeDocument{const old=JSON.parse(value) as Partial<ResumeDocument>&{cv?:Partial<ResumeData>};const template=isResumeTemplate(String(old.template))?old.template as ResumeTemplate:"essential",doc=createResume("blank",template);doc.title=old.cv?.name?"Currículo — "+old.cv.name:"Meu currículo";doc.cv={...doc.cv,...old.cv};doc.accent=typeof old.accent==="string"?old.accent:doc.accent;doc.density=old.density==="compact"?"compact":"comfortable";doc.sectionOrder=Array.isArray(old.sectionOrder)?old.sectionOrder.filter((x):x is ResumeSection=>defaultOrder.includes(x as ResumeSection)):doc.sectionOrder;if(!doc.sectionOrder.length)doc.sectionOrder=[...defaultOrder];doc.hidden=Array.isArray(old.hidden)?old.hidden.filter((x):x is ResumeSection=>defaultOrder.includes(x as ResumeSection)):[];return doc}
