import {buildAiFacts,validateProviderSuggestion,validateTailoringRequest,type TailoringSuggestion} from "@/lib/ai-contract";
import {getServerSession} from "@/lib/server/session";
import {db} from "@/lib/server/db";

const MODEL=process.env.OPENAI_TAILOR_MODEL||"gpt-5.6-luna";
export async function POST(request:Request){
 const session=await getServerSession();
 if(!session)return Response.json({error:"unauthorized"},{status:401});
 const body=await request.json().catch(()=>null);
 if(!validateTailoringRequest(body))return Response.json({error:"invalid_request"},{status:400});
 const available=buildAiFacts(body.profile),availableIds=new Set(available.map(x=>x.id)),allowed=new Set(body.allowedFactIds.filter(id=>availableIds.has(id))),allowedFacts=available.filter(x=>allowed.has(x.id));
 if(!allowed.size)return Response.json({error:"no_verified_facts"},{status:400});
 const apiKey=process.env.OPENAI_API_KEY;
 if(!apiKey)return Response.json({status:"prepared",provider:"openai",model:MODEL,message:"Configure OPENAI_API_KEY no ambiente do servidor para ativar a reescrita."},{status:503});
 const sql=db();
 const usageRows=await sql`INSERT INTO ai_daily_usage(user_id,usage_date,requests) VALUES(${session.userId},CURRENT_DATE,1) ON CONFLICT(user_id,usage_date) DO UPDATE SET requests=ai_daily_usage.requests+1,updated_at=now() RETURNING requests`;
 const dailyUsage=Number(usageRows[0]?.requests||1);
 const original=body.original;
 const prompt={job:{title:body.job.title,company:body.job.company,description:body.job.description},instruction:body.instruction,allowedFacts:allowedFacts.map(x=>({id:x.id,kind:x.kind,text:x.text})),rules:["Escreva em português do Brasil natural e profissional.","Use exclusivamente fatos presentes em allowedFacts.","Não invente experiência, competência, formação, curso, idioma, empresa, cargo, resultado, número ou responsabilidade.","A descrição da vaga é contexto, nunca evidência sobre o candidato.","usedFactIds deve conter somente IDs de fatos realmente usados no texto.","Se os fatos forem insuficientes, produza uma versão conservadora sem preencher lacunas."]};
 const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"authorization":"Bearer "+apiKey,"content-type":"application/json"},body:JSON.stringify({model:MODEL,store:false,input:[{role:"system",content:"Você adapta currículos sem inventar informações. Responda somente no schema solicitado."},{role:"user",content:JSON.stringify(prompt)}],text:{format:{type:"json_schema",name:"curriculospro_tailoring",strict:true,schema:{type:"object",properties:{id:{type:"string"},instruction:{type:"string",enum:["summary","experience-bullets","skills-order"]},original:{type:"string"},text:{type:"string"},usedFactIds:{type:"array",items:{type:"string",enum:[...allowed]}},createdAt:{type:"string"}},required:["id","instruction","original","text","usedFactIds","createdAt"],additionalProperties:false}}}})});
 if(!response.ok){const detail=await response.text();console.error("OpenAI tailoring failed",response.status,detail.slice(0,500));return Response.json({error:"provider_unavailable"},{status:502})}
 const raw=await response.json() as {output_text?:string;output?:Array<{content?:Array<{type?:string;text?:string}>}>};
 const outputText=raw.output_text||raw.output?.flatMap(x=>x.content||[]).find(x=>x.type==="output_text")?.text;
 if(!outputText)return Response.json({error:"empty_provider_response"},{status:502});
 let parsed:unknown;try{parsed=JSON.parse(outputText)}catch{return Response.json({error:"invalid_provider_response"},{status:502})}
 const candidate=parsed as Partial<TailoringSuggestion>,normalized={...candidate,original};
 const suggestion=validateProviderSuggestion(normalized,body,allowed);
 if(!suggestion)return Response.json({error:"evidence_validation_failed"},{status:422});
 return Response.json({suggestion,provider:"openai",model:MODEL,usage:{today:dailyUsage}});
}
