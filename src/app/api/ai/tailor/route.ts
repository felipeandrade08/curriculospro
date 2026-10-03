import {buildAiFacts,validateTailoringRequest} from "@/lib/ai-contract";
import {getServerSession} from "@/lib/server/session";

export async function POST(request:Request){
 const session=await getServerSession();
 if(!session)return Response.json({error:"unauthorized"},{status:401});
 const body=await request.json().catch(()=>null);
 if(!validateTailoringRequest(body))return Response.json({error:"invalid_request"},{status:400});
 const available=buildAiFacts(body.profile),availableIds=new Set(available.map(x=>x.id)),allowed=new Set(body.allowedFactIds.filter(id=>availableIds.has(id)));
 if(!allowed.size)return Response.json({error:"no_verified_facts"},{status:400});
 // Provider intentionally not connected yet. A future provider response must declare usedFactIds and pass the evidence gate before it can be returned.
 return Response.json({status:"prepared",provider:null,allowedFacts:available.filter(x=>allowed.has(x.id)),message:"A infraestrutura de adaptação está pronta, mas nenhum provedor de IA foi ativado."},{status:501});
}
