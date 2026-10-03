import {db} from "@/lib/server/db";
import {getServerSession} from "@/lib/server/session";
import {defaultOrder,isResumeDocument} from "@/lib/resume";
type Context={params:Promise<{id:string}>};

export async function PUT(request:Request,{params}:Context){
 const session=await getServerSession();if(!session)return Response.json({error:"unauthorized"},{status:401});
 const {id}=await params;
 let body:unknown;try{body=await request.json()}catch{return Response.json({error:"invalid_json"},{status:400})}
 if(!isResumeDocument(body)||body.id!==id)return Response.json({error:"invalid_resume"},{status:400});
 const revisionValue=(body as typeof body&{revision?:unknown}).revision,expected=Number(revisionValue||0);
 if(!Number.isInteger(expected)||expected<0)return Response.json({error:"invalid_revision"},{status:400});
 if(body.title.length>160||body.accent.length>32||!defaultOrder.every(x=>body.sectionOrder.includes(x)||body.hidden.includes(x)))return Response.json({error:"invalid_resume"},{status:400});
 const sql=db();
 const existing=await sql`SELECT id,revision,updated_at,payload,title,template,accent,density,section_order,hidden_sections,created_at FROM resumes WHERE id=${id} AND user_id=${session.userId} AND deleted_at IS NULL`;
 if(existing.length&&Number(existing[0].revision)!==expected){
  const row=existing[0];
  return Response.json({error:"conflict",remote:{document:{id:String(row.id),title:String(row.title),template:row.template,accent:String(row.accent),density:row.density,cv:row.payload,sectionOrder:row.section_order,hidden:row.hidden_sections,createdAt:new Date(String(row.created_at)).toISOString(),updatedAt:new Date(String(row.updated_at)).toISOString()},revision:Number(row.revision),updatedAt:new Date(String(row.updated_at)).toISOString()}},{status:409});
 }
 const revision=existing.length?expected+1:1;
 const rows=await sql`INSERT INTO resumes(id,user_id,title,template,accent,density,payload,section_order,hidden_sections,revision,created_at,updated_at) VALUES(${id},${session.userId},${body.title},${body.template},${body.accent},${body.density},${JSON.stringify(body.cv)}::jsonb,${JSON.stringify(body.sectionOrder)}::jsonb,${JSON.stringify(body.hidden)}::jsonb,${revision},${body.createdAt},now()) ON CONFLICT(id) DO UPDATE SET title=EXCLUDED.title,template=EXCLUDED.template,accent=EXCLUDED.accent,density=EXCLUDED.density,payload=EXCLUDED.payload,section_order=EXCLUDED.section_order,hidden_sections=EXCLUDED.hidden_sections,revision=${revision},updated_at=now(),deleted_at=NULL WHERE resumes.user_id=${session.userId} RETURNING revision,updated_at`;
 if(!rows.length)return Response.json({error:"forbidden"},{status:403});
 return Response.json({revision:Number(rows[0].revision),updatedAt:new Date(String(rows[0].updated_at)).toISOString()});
}
export async function DELETE(_:Request,{params}:Context){const session=await getServerSession();if(!session)return Response.json({error:"unauthorized"},{status:401});const {id}=await params,sql=db();await sql`UPDATE resumes SET deleted_at=now(),updated_at=now(),revision=revision+1 WHERE id=${id} AND user_id=${session.userId} AND deleted_at IS NULL`;return new Response(null,{status:204})}
