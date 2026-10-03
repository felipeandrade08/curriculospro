import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const dir=path.join(process.cwd(),"public","brand");
const source=path.join(dir,"logo.png");
const {data,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
for(let i=0;i<data.length;i+=4){
  const r=data[i],g=data[i+1],b=data[i+2];
  const darkness=255-Math.min(r,g,b);
  data[i+3]=darkness<=8?0:darkness>=28?255:Math.round((darkness-8)/20*255);
}
const transparent=sharp(data,{raw:info});
await transparent.clone().trim({background:{r:255,g:255,b:255,alpha:0},threshold:8}).png({compressionLevel:9}).toFile(path.join(dir,"logo-transparent.png"));
const meta=await sharp(path.join(dir,"logo-transparent.png")).metadata();
const symbolHeight=Math.max(1,Math.round((meta.height||600)*0.72));
await sharp(path.join(dir,"logo-transparent.png")).extract({left:0,top:0,width:meta.width||800,height:symbolHeight}).trim().resize(256,256,{fit:"contain",background:{r:0,g:0,b:0,alpha:0}}).png({compressionLevel:9}).toFile(path.join(dir,"icon.png"));
console.log("CurriculosPRO brand assets prepared.");
