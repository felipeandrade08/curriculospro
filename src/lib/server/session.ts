import {auth} from "@/lib/auth/server";
import {db} from "@/lib/server/db";
export type ServerSession={userId:string;email:string;displayName:string|null;plan:"free"|"pro"};
export async function getServerSession():Promise<ServerSession|null>{
 const result=await auth.getSession();
 const user=result.data?.user;
 if(!user?.id||!user.email)return null;
 const sql=db();
 const rows=await sql`INSERT INTO app_users(id,email,display_name) VALUES(${user.id},${user.email},${user.name||null}) ON CONFLICT(id) DO UPDATE SET email=EXCLUDED.email,display_name=COALESCE(EXCLUDED.display_name,app_users.display_name),updated_at=now() RETURNING plan`;
 return{userId:user.id,email:user.email,displayName:user.name||null,plan:rows[0]?.plan==="pro"?"pro":"free"};
}
export async function requireServerSession(){const session=await getServerSession();if(!session)throw new Error("UNAUTHORIZED");return session}
