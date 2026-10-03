import {isProfessionalProfile,type JobTarget,type ProfessionalProfile} from "@/lib/resume";

export type AiFact={id:string;kind:"experience"|"education"|"skill"|"course"|"language"|"identity";text:string};
export type TailoringRequest={job:JobTarget;profile:ProfessionalProfile;allowedFactIds:string[];original:string;instruction:"summary"|"experience-bullets"|"skills-order"};
export type TailoringSuggestion={id:string;instruction:TailoringRequest["instruction"];original:string;text:string;usedFactIds:string[];createdAt:string};
export type TailoringReview={suggestion:TailoringSuggestion;facts:AiFact[]};

export function buildAiFacts(profile:ProfessionalProfile):AiFact[]{
 return[
  ...profile.experiences.flatMap(x=>[{id:"exp:"+x.id+":title",kind:"experience" as const,text:[x.title,x.subtitle,x.period].filter(Boolean).join(" · ")},{id:"exp:"+x.id+":description",kind:"experience" as const,text:x.description}]),
  ...profile.education.flatMap(x=>[{id:"edu:"+x.id+":title",kind:"education" as const,text:[x.title,x.subtitle,x.period].filter(Boolean).join(" · ")},{id:"edu:"+x.id+":description",kind:"education" as const,text:x.description}]),
  ...profile.skills.map((x,i)=>({id:"skill:"+i,kind:"skill" as const,text:x})),
  ...profile.courses.map((x,i)=>({id:"course:"+i,kind:"course" as const,text:x})),
  ...profile.languages.map((x,i)=>({id:"language:"+i,kind:"language" as const,text:x}))
 ].filter(x=>x.text.trim());
}
export function validateTailoringRequest(value:unknown):value is TailoringRequest{
 if(!value||typeof value!=="object")return false;const x=value as Partial<TailoringRequest>,job=x.job as JobTarget|undefined;
 return !!job&&job.version===1&&typeof job.title==="string"&&typeof job.company==="string"&&typeof job.description==="string"&&typeof job.updatedAt==="string"&&isProfessionalProfile(x.profile)&&Array.isArray(x.allowedFactIds)&&x.allowedFactIds.every(v=>typeof v==="string")&&typeof x.original==="string"&&["summary","experience-bullets","skills-order"].includes(String(x.instruction));
}
export function enforceEvidence(suggestion:Pick<TailoringSuggestion,"usedFactIds">,allowed:Set<string>){
 return suggestion.usedFactIds.length>0&&suggestion.usedFactIds.every(id=>allowed.has(id));
}

export function validateProviderSuggestion(value:unknown,request:TailoringRequest,allowed:Set<string>):TailoringSuggestion|null{
 if(!value||typeof value!=="object")return null;const x=value as Partial<TailoringSuggestion>;
 if(typeof x.id!=="string"||!x.id||x.instruction!==request.instruction||typeof x.original!=="string"||typeof x.text!=="string"||!x.text.trim()||!Array.isArray(x.usedFactIds)||!x.usedFactIds.every(v=>typeof v==="string")||typeof x.createdAt!=="string")return null;
 const suggestion=x as TailoringSuggestion;
 return enforceEvidence(suggestion,allowed)?suggestion:null;
}
