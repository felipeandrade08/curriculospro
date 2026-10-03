export type ServerSession={userId:string;email:string;displayName:string|null;plan:"free"|"pro"};
export async function getServerSession():Promise<ServerSession|null>{
 // Package 4 seam: Neon Auth/Better Auth will resolve the authenticated identity here.
 // Keeping this isolated prevents auth provider details from leaking into resume sync.
 return null;
}
export async function requireServerSession(){const session=await getServerSession();if(!session)throw new Error("UNAUTHORIZED");return session}
