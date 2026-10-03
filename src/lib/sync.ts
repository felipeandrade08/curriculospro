import type {ResumeDocument} from "@/lib/resume";
export type CloudResume={document:ResumeDocument;revision:number;updatedAt:string};
export type SyncConflict={kind:"conflict";local:ResumeDocument;remote:CloudResume};
export type SyncResult={kind:"saved";remote:CloudResume}|SyncConflict;
export function chooseNewer(local:ResumeDocument,remote:CloudResume){return new Date(local.updatedAt).getTime()>new Date(remote.updatedAt).getTime()?"local":"remote" as const}
