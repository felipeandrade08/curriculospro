import {db} from "@/lib/server/db";
import {getServerSession} from "@/lib/server/session";

export async function GET(){
 const session=await getServerSession();
 if(!session)return Response.json({error:"unauthorized"},{status:401});
 const sql=db();
 const rows=await sql`SELECT id,title,template,accent,density,payload,section_order,hidden_sections,revision,created_at,updated_at FROM resumes WHERE user_id=${session.userId} AND deleted_at IS NULL ORDER BY updated_at DESC`;
 const deletedRows=await sql`SELECT id,revision,updated_at,deleted_at FROM resumes WHERE user_id=${session.userId} AND deleted_at IS NOT NULL ORDER BY deleted_at DESC`;
 const resumes=rows.map(row=>({
  document:{id:String(row.id),title:String(row.title),template:row.template,accent:String(row.accent),density:row.density,cv:row.payload,sectionOrder:row.section_order,hidden:row.hidden_sections,createdAt:new Date(String(row.created_at)).toISOString(),updatedAt:new Date(String(row.updated_at)).toISOString()},
  revision:Number(row.revision),updatedAt:new Date(String(row.updated_at)).toISOString()
 }));
 const deleted=deletedRows.map(row=>({id:String(row.id),revision:Number(row.revision),updatedAt:new Date(String(row.updated_at)).toISOString(),deletedAt:new Date(String(row.deleted_at)).toISOString()}));
 return Response.json({resumes,deleted});
}
