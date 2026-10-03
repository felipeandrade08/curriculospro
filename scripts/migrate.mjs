import fs from "node:fs/promises";
import path from "node:path";
import {neon} from "@neondatabase/serverless";

const url=process.env.DATABASE_URL;
if(!url)throw new Error("DATABASE_URL is required");
const sql=neon(url);
await sql`CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`;
const dir=path.join(process.cwd(),"database","migrations");
const files=(await fs.readdir(dir)).filter(x=>x.endsWith(".sql")).sort();
for(const name of files){
 const exists=await sql`SELECT 1 FROM schema_migrations WHERE name=${name}`;
 if(exists.length){console.log("skip",name);continue}
 const source=await fs.readFile(path.join(dir,name),"utf8");
 await sql.transaction([sql.query(source),sql`INSERT INTO schema_migrations(name) VALUES(${name})`]);
 console.log("applied",name);
}
