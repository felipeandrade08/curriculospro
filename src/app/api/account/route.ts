import {getServerSession} from "@/lib/server/session";

export async function GET(){
 try{
  const session=await getServerSession();
  if(!session)return Response.json({error:"unauthorized"},{status:401});
  return Response.json({account:{email:session.email,displayName:session.displayName,plan:session.plan}});
 }catch{
  return Response.json({error:"account_unavailable"},{status:500});
 }
}
