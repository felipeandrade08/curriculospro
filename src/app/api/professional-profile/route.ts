import {db} from "@/lib/server/db";
import {getServerSession} from "@/lib/server/session";
import {isProfessionalProfile} from "@/lib/resume";

export async function GET(){
 const session=await getServerSession();
 if(!session)return Response.json({error:"unauthorized"},{status:401});
 const sql=db();
 const rows=await sql`SELECT payload,revision,updated_at FROM professional_profiles WHERE user_id=${session.userId}`;
 if(!rows.length)return Response.json({profile:null,revision:0});
 const profile=rows[0].payload;
 if(!isProfessionalProfile(profile))return Response.json({error:"invalid_profile"},{status:500});
 return Response.json({profile,revision:Number(rows[0].revision),updatedAt:new Date(String(rows[0].updated_at)).toISOString()});
}

export async function PUT(request:Request){
 const session=await getServerSession();
 if(!session)return Response.json({error:"unauthorized"},{status:401});
 const body=await request.json().catch(()=>null) as {profile?:unknown;expectedRevision?:number}|null;
 if(!body||!isProfessionalProfile(body.profile))return Response.json({error:"invalid_profile"},{status:400});
 const expected=Number(body.expectedRevision||0),sql=db();
 if(expected===0){
  const existing=await sql`SELECT revision FROM professional_profiles WHERE user_id=${session.userId}`;
  if(existing.length)return Response.json({error:"revision_conflict",revision:Number(existing[0].revision)},{status:409});
  const rows=await sql`INSERT INTO professional_profiles(user_id,payload) VALUES(${session.userId},${JSON.stringify(body.profile)}::jsonb) RETURNING revision,updated_at`;
  return Response.json({revision:Number(rows[0].revision),updatedAt:new Date(String(rows[0].updated_at)).toISOString()});
 }
 const rows=await sql`UPDATE professional_profiles SET payload=${JSON.stringify(body.profile)}::jsonb,revision=revision+1,updated_at=now() WHERE user_id=${session.userId} AND revision=${expected} RETURNING revision,updated_at`;
 if(!rows.length){const current=await sql`SELECT revision FROM professional_profiles WHERE user_id=${session.userId}`;return Response.json({error:"revision_conflict",revision:Number(current[0]?.revision||0)},{status:409})}
 return Response.json({revision:Number(rows[0].revision),updatedAt:new Date(String(rows[0].updated_at)).toISOString()});
}
