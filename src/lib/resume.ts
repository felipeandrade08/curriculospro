export type ResumeTemplate="essential"|"modern"|"executive"|"minimal"|"creative";
export type ResumeDensity="comfortable"|"compact";
export type ResumeSection="summary"|"experiences"|"education"|"skills"|"languages"|"courses";
export type ResumeItem={id:string;title:string;subtitle:string;period:string;description:string};
export type ResumeData={name:string;role:string;email:string;phone:string;city:string;summary:string;photo:string;experiences:ResumeItem[];education:ResumeItem[];courses:string[];skills:string[];languages:string[]};
export type ResumeDocument={id:string;title:string;createdAt:string;updatedAt:string;cv:ResumeData;template:ResumeTemplate;accent:string;density:ResumeDensity;sectionOrder:ResumeSection[];hidden:ResumeSection[]};
const isText=(x:unknown):x is string=>typeof x==="string";
const isItem=(x:unknown):x is ResumeItem=>{if(!x||typeof x!=="object")return false;const i=x as Partial<ResumeItem>;return [i.id,i.title,i.subtitle,i.period,i.description].every(isText)};
export type ProfessionalProfile={version:1;updatedAt:string;name:string;email:string;phone:string;city:string;photo:string;experiences:ResumeItem[];education:ResumeItem[];courses:string[];skills:string[];languages:string[]};
export const PROFESSIONAL_PROFILE_KEY="curriculospro.professionalProfile.v1";
export const emptyProfessionalProfile=():ProfessionalProfile=>({version:1,updatedAt:new Date().toISOString(),name:"",email:"",phone:"",city:"",photo:"",experiences:[],education:[],courses:[],skills:[],languages:[]});
export function isProfessionalProfile(x:unknown):x is ProfessionalProfile{
 if(!x||typeof x!=="object")return false;const p=x as Partial<ProfessionalProfile>;
 return p.version===1&&isText(p.updatedAt)&&[p.name,p.email,p.phone,p.city,p.photo].every(isText)&&Array.isArray(p.experiences)&&p.experiences.every(isItem)&&Array.isArray(p.education)&&p.education.every(isItem)&&Array.isArray(p.courses)&&p.courses.every(isText)&&Array.isArray(p.skills)&&p.skills.every(isText)&&Array.isArray(p.languages)&&p.languages.every(isText);
}
export function profileFromResume(doc:ResumeDocument):ProfessionalProfile{return{version:1,updatedAt:new Date().toISOString(),name:doc.cv.name,email:doc.cv.email,phone:doc.cv.phone,city:doc.cv.city,photo:doc.cv.photo,experiences:doc.cv.experiences.map(x=>({...x,id:uid()})),education:doc.cv.education.map(x=>({...x,id:uid()})),courses:[...doc.cv.courses],skills:[...doc.cv.skills],languages:[...doc.cv.languages]}}
export const RESUME_LIBRARY_KEY="curriculospro.resumes.v3";
export const ACTIVE_RESUME_KEY="curriculospro.activeResume.v3";
export const LEGACY_RESUME_KEY="curriculospro.cv.v2";
export const defaultOrder:ResumeSection[]=["summary","experiences","education","skills","languages","courses"];
export const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
export const emptyResumeData=():ResumeData=>({name:"",photo:"",role:"",email:"",phone:"",city:"",summary:"",experiences:[],education:[],courses:[],skills:[],languages:[]});
export const exampleResumeData=():ResumeData=>({name:"Mariana Costa",photo:"",role:"Analista de Marketing",email:"mariana@email.com",phone:"(11) 99999-9999",city:"São Paulo, SP",summary:"Profissional de marketing com experiência em planejamento de campanhas, conteúdo e análise de resultados.",experiences:[{id:uid(),title:"Analista de Marketing",subtitle:"Empresa Exemplo",period:"2024 — Atual",description:"Planejamento e acompanhamento de campanhas digitais, produção de conteúdo e análise de indicadores."}],education:[{id:uid(),title:"Marketing",subtitle:"Instituição de Ensino",period:"2021 — 2023",description:""}],courses:["Marketing Digital"],skills:["Planejamento","Conteúdo","Análise de dados"],languages:["Português — Nativo"]});
export const exampleProfiles=[
 {id:"first-job",name:"Primeiro emprego",role:"Jovem aprendiz / Auxiliar",summary:"Busco minha primeira oportunidade profissional para desenvolver minhas habilidades, aprender novas atividades e contribuir com dedicação, responsabilidade e vontade de crescer.",experienceTitle:"Projeto acadêmico",experienceCompany:"Atividade escolar",experiencePeriod:"2025",experienceDescription:"Participação em atividades em grupo, organização de tarefas e apresentação de trabalhos.",educationTitle:"Ensino Médio",educationCompany:"Instituição de Ensino",educationPeriod:"2023 — 2025",courses:["Informática básica"],skills:["Organização","Comunicação","Facilidade de aprendizado","Trabalho em equipe"],languages:["Português — Nativo"]},
 {id:"administrative",name:"Administrativo",role:"Auxiliar Administrativo",summary:"Busco atuar na área administrativa, contribuindo com organização, atenção aos detalhes e apoio às rotinas e aos processos da equipe.",experienceTitle:"Auxiliar Administrativo",experienceCompany:"Empresa Exemplo",experiencePeriod:"2023 — 2025",experienceDescription:"Apoio à organização de documentos, atualização de planilhas, atendimento telefônico e suporte às rotinas administrativas.",educationTitle:"Técnico em Administração",educationCompany:"Instituição de Ensino",educationPeriod:"2022 — 2023",courses:["Pacote Office"],skills:["Microsoft Excel","Organização de documentos","Atendimento","Comunicação escrita"],languages:["Português — Nativo"]},
 {id:"retail",name:"Comércio e atendimento",role:"Atendente / Vendedor",summary:"Busco uma oportunidade em atendimento e comércio, oferecendo comunicação cordial, atenção às necessidades dos clientes e compromisso com uma boa experiência.",experienceTitle:"Atendente",experienceCompany:"Comércio Exemplo",experiencePeriod:"2024 — 2025",experienceDescription:"Atendimento ao público, organização de produtos, apoio ao registro de pedidos e esclarecimento de dúvidas.",educationTitle:"Ensino Médio",educationCompany:"Instituição de Ensino",educationPeriod:"Concluído em 2023",courses:["Atendimento ao cliente"],skills:["Atendimento ao cliente","Comunicação clara","Organização","Trabalho em equipe"],languages:["Português — Nativo"]},
 {id:"logistics",name:"Logística e estoque",role:"Auxiliar de Logística",summary:"Desejo atuar na área de logística, contribuindo com organização, conferência de mercadorias e cumprimento dos procedimentos operacionais.",experienceTitle:"Auxiliar de Estoque",experienceCompany:"Centro de Distribuição Exemplo",experiencePeriod:"2023 — 2025",experienceDescription:"Apoio à conferência e organização de mercadorias, separação de pedidos e atualização de registros de estoque.",educationTitle:"Ensino Médio",educationCompany:"Instituição de Ensino",educationPeriod:"Concluído em 2022",courses:["Noções de logística"],skills:["Controle de estoque","Conferência de mercadorias","Separação de pedidos","Atenção aos detalhes"],languages:["Português — Nativo"]},
 {id:"industry",name:"Indústria e produção",role:"Auxiliar de Produção",summary:"Busco atuar na área de produção, colaborando com responsabilidade, atenção aos procedimentos, organização e compromisso com a qualidade.",experienceTitle:"Auxiliar de Produção",experienceCompany:"Indústria Exemplo",experiencePeriod:"2024 — 2025",experienceDescription:"Apoio às atividades da linha de produção, organização do posto de trabalho, embalagem e inspeção visual conforme orientação.",educationTitle:"Ensino Médio",educationCompany:"Instituição de Ensino",educationPeriod:"Concluído em 2023",courses:["Boas práticas de segurança"],skills:["Organização","Atenção aos procedimentos","Trabalho em equipe","Comprometimento"],languages:["Português — Nativo"]},
 {id:"technology",name:"Tecnologia e suporte",role:"Assistente de TI",summary:"Busco uma oportunidade em tecnologia para aplicar meus conhecimentos, desenvolver novas competências e colaborar com soluções e melhorias.",experienceTitle:"Suporte de Informática",experienceCompany:"Projeto de Aprendizagem",experiencePeriod:"2024 — 2025",experienceDescription:"Apoio na configuração básica de computadores, instalação de programas autorizados e orientação a usuários em dúvidas comuns.",educationTitle:"Técnico em Informática",educationCompany:"Instituição de Ensino",educationPeriod:"2023 — 2025",courses:["Fundamentos de redes","Informática aplicada"],skills:["Informática","Suporte técnico básico","Resolução de problemas","Comunicação"],languages:["Português — Nativo"]}
] as const;
export type ExampleProfileId=typeof exampleProfiles[number]["id"];
export function exampleResumeDataFor(profileId:string):ResumeData{
 const p=exampleProfiles.find(x=>x.id===profileId)||exampleProfiles[0];
 return{name:"Nome Sobrenome",photo:"",role:p.role,email:"seu.email@exemplo.com",phone:"(00) 00000-0000",city:"Sua cidade, UF",summary:p.summary,experiences:[{id:uid(),title:p.experienceTitle,subtitle:p.experienceCompany,period:p.experiencePeriod,description:p.experienceDescription}],education:[{id:uid(),title:p.educationTitle,subtitle:p.educationCompany,period:p.educationPeriod,description:""}],courses:[...p.courses],skills:[...p.skills],languages:[...p.languages]};
}
export function createResume(mode:"blank"|"example"="blank",template:ResumeTemplate="essential"):ResumeDocument{const now=new Date().toISOString();return{id:uid(),title:mode==="example"?"Currículo de exemplo":"Meu currículo",createdAt:now,updatedAt:now,cv:mode==="example"?exampleResumeData():emptyResumeData(),template,accent:"#087cf0",density:"comfortable",sectionOrder:[...defaultOrder],hidden:[]}}

export type JobTarget={version:1;title:string;company:string;description:string;updatedAt:string};
export type JobEvidence={term:string;sources:string[]};
export type JobAnalysis={matched:JobEvidence[];unverified:string[];profileFacts:string[]};
export type JobSelectionKind="experience"|"education"|"skill"|"course"|"language";
export type JobSelectionItem={id:string;kind:JobSelectionKind;label:string;detail:string;matchedTerms:string[]};
export type JobSelection={version:1;resumeId:string;jobUpdatedAt:string;profileUpdatedAt?:string;selectedIds:string[];updatedAt:string};
export const JOB_SELECTION_KEY="curriculospro.jobSelection.v1";
export const JOB_TARGET_KEY="curriculospro.jobTarget.v1";
export const emptyJobTarget=():JobTarget=>({version:1,title:"",company:"",description:"",updatedAt:new Date().toISOString()});
const normalizeWords=(value:string)=>value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9+#.\s-]/g," ").split(/\s+/).filter(x=>x.length>=3);
const meaningfulTerms=(value:string)=>{const stop=new Set(["para","com","uma","das","dos","que","por","como","mais","sua","seu","ser","ter","the","and","for","with","this","from"]);return [...new Set(normalizeWords(value).filter(x=>!stop.has(x)))].slice(0,80)};
export function buildJobSelection(target:JobTarget,profile:ProfessionalProfile):JobSelectionItem[]{
 const terms=meaningfulTerms(target.title+" "+target.description),matches=(value:string)=>terms.filter(term=>normalizeWords(value).includes(term));
 const items:JobSelectionItem[]=[
  ...profile.experiences.map(x=>({id:"exp:"+x.id,kind:"experience" as const,label:x.title||"Experiência",detail:[x.subtitle,x.period].filter(Boolean).join(" · "),matchedTerms:matches([x.title,x.subtitle,x.description].join(" "))})),
  ...profile.education.map(x=>({id:"edu:"+x.id,kind:"education" as const,label:x.title||"Formação",detail:[x.subtitle,x.period].filter(Boolean).join(" · "),matchedTerms:matches([x.title,x.subtitle,x.description].join(" "))})),
  ...profile.skills.map((x,i)=>({id:"skill:"+i,kind:"skill" as const,label:x,detail:"Competência do Perfil Profissional",matchedTerms:matches(x)})),
  ...profile.courses.map((x,i)=>({id:"course:"+i,kind:"course" as const,label:x,detail:"Curso ou certificação",matchedTerms:matches(x)})),
  ...profile.languages.map((x,i)=>({id:"language:"+i,kind:"language" as const,label:x,detail:"Idioma informado no perfil",matchedTerms:matches(x)}))
 ];
 return items.filter(x=>x.label.trim()).sort((a,b)=>Number(b.matchedTerms.length>0)-Number(a.matchedTerms.length>0));
}
export function analyzeJobTarget(target:JobTarget,profile:ProfessionalProfile,resume?:ResumeData):JobAnalysis{
 const facts=[
  ...profile.skills.map(x=>({label:x,source:"Competência do perfil"})),
  ...profile.courses.map(x=>({label:x,source:"Curso do perfil"})),
  ...profile.languages.map(x=>({label:x,source:"Idioma do perfil"})),
  ...profile.experiences.flatMap(x=>[{label:x.title,source:"Experiência: "+(x.title||"sem título")},{label:x.description,source:"Descrição de experiência"}]),
  ...profile.education.flatMap(x=>[{label:x.title,source:"Formação"},{label:x.description,source:"Descrição de formação"}]),
  ...(resume?[...resume.skills.map(x=>({label:x,source:"Competência deste currículo"})),{label:resume.role,source:"Objetivo deste currículo"},{label:resume.summary,source:"Resumo deste currículo"}]:[])
 ].filter(x=>x.label.trim());
 const jobTerms=meaningfulTerms(target.title+" "+target.description),matched:JobEvidence[]=[],unverified:string[]=[];
 for(const term of jobTerms){const sources=facts.filter(f=>normalizeWords(f.label).includes(term)).map(f=>f.source);sources.length?matched.push({term,sources:[...new Set(sources)]}):unverified.push(term)}
 return{matched,unverified:unverified.slice(0,24),profileFacts:[...new Set(facts.map(x=>x.label.trim()))].slice(0,80)};
}
export type PlanId="free"|"pro";
export type AccountMode="guest"|"account";
export type ProductAccess={plan:PlanId;accountMode:AccountMode};
export const PRODUCT_ACCESS_KEY="curriculospro.access.v1";
export const defaultAccess:ProductAccess={plan:"free",accountMode:"guest"};
export const features={multipleResumes:{free:true,pro:true},pdfExport:{free:true,pro:true},allCurrentTemplates:{free:true,pro:true},backup:{free:true,pro:true},cloudSync:{free:true,pro:true},aiRewrite:{free:false,pro:true},jobTailoring:{free:false,pro:true},coverLetter:{free:false,pro:true}} as const;
export type ResumeBackup={product:"CurriculosPRO";version:3;exportedAt:string;resumes:ResumeDocument[]};
const isSection=(x:unknown):x is ResumeSection=>isText(x)&&defaultOrder.includes(x as ResumeSection);
export function isResumeDocument(x:unknown):x is ResumeDocument{
 if(!x||typeof x!=="object")return false;const d=x as Partial<ResumeDocument>,cv=d.cv as Partial<ResumeData>|undefined;
 if(!isText(d.id)||!d.id||!isText(d.title)||!isText(d.createdAt)||!isText(d.updatedAt)||!isResumeTemplate(isText(d.template)?d.template:null)||!isText(d.accent)||!/^#[0-9a-f]{6}$/i.test(d.accent)||(d.density!=="comfortable"&&d.density!=="compact")||!Array.isArray(d.sectionOrder)||!d.sectionOrder.every(isSection)||new Set(d.sectionOrder).size!==d.sectionOrder.length||!Array.isArray(d.hidden)||!d.hidden.every(isSection)||!cv)return false;
 const textFields=[cv.name,cv.role,cv.email,cv.phone,cv.city,cv.summary,cv.photo];
 return textFields.every(isText)&&Array.isArray(cv.experiences)&&cv.experiences.every(isItem)&&Array.isArray(cv.education)&&cv.education.every(isItem)&&Array.isArray(cv.courses)&&cv.courses.every(isText)&&Array.isArray(cv.skills)&&cv.skills.every(isText)&&Array.isArray(cv.languages)&&cv.languages.every(isText);
}
export function parseBackup(value:string):ResumeDocument[]{const raw=JSON.parse(value) as Partial<ResumeBackup>;if(raw.product!=="CurriculosPRO"||raw.version!==3||!Array.isArray(raw.resumes))throw new Error("invalid-backup");const docs=raw.resumes.filter(isResumeDocument);if(!docs.length)throw new Error("empty-backup");return docs}
export function isResumeTemplate(value:string|null):value is ResumeTemplate{return value==="essential"||value==="modern"||value==="executive"||value==="minimal"||value==="creative"}
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
