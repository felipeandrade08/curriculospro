import {db} from "@/lib/server/db";
import {getServerSession} from "@/lib/server/session";
export async function GET(){const session=await getServerSession();if(!session)return Response.json({error:"unauthorized"},{status:401});const sql=db();const rows=await sql`SELECT id,title,template,accent,density,payload,section_order,hidden_sections,revision,created_at,updated_at FROM resumes WHERE user_id=${session.userId} AND deleted_at IS NULL ORDER BY updated_at DESC`;return Response.json({resumes:rows})}
