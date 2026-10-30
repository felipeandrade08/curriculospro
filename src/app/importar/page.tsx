"use client";
import {useMemo,useState} from "react";
import {useRouter} from "next/navigation";
import {RESUME_LIBRARY_KEY,ACTIVE_RESUME_KEY,createResume,type ResumeData,type ResumeDocument} from "@/lib/resume";

const clean=(s:string)=>s.replace(/\u0000/g,"").replace(/[ \t]+/g," ").trim();
function decodeEntities(s:string){return s.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&#x([\da-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16)));}
async function docxText(file:File){
 const bytes=await file.arrayBuffer(),view=new DataView(bytes);let eocd=-1;
 for(let p=bytes.byteLength-22;p>=Math.max(0,bytes.byteLength-65558);p--){if(view.getUint32(p,true)===0x06054b50){eocd=p;break;}}
 if(eocd<0)throw new Error("Não foi possível ler a estrutura do DOCX.");
 const count=view.getUint16(eocd+10,true),offset=view.getUint32(eocd+16,true);let p=offset;
 for(let n=0;n<count;n++){
  if(view.getUint32(p,true)!==0x02014b50)break;
  const method=view.getUint16(p+10,true),compressed=view.getUint32(p+20,true),nameLen=view.getUint16(p+28,true),extra=view.getUint16(p+30,true),comment=view.getUint16(p+32,true),local=view.getUint32(p+42,true),name=new TextDecoder().decode(new Uint8Array(bytes,p+46,nameLen));
  if(name==="word/document.xml"){
   const localName=view.getUint16(local+26,true),localExtra=view.getUint16(local+28,true),start=local+30+localName+localExtra,part=bytes.slice(start,start+compressed);let xml:string;
   if(method===0)xml=new TextDecoder().decode(part);
   else if(method===8){const stream=new Blob([part]).stream().pipeThrough(new DecompressionStream("deflate-raw" as CompressionFormat));xml=await new Response(stream).text();}
   else throw new Error("Formato de compressão DOCX não suportado.");
   const parsed=new DOMParser().parseFromString(xml,"application/xml");
   if(parsed.querySelector("parsererror"))throw new Error("O documento Word contém uma estrutura inválida.");
   const w="http://schemas.openxmlformats.org/wordprocessingml/2006/main",body=parsed.getElementsByTagNameNS(w,"body")[0];
   if(!body)throw new Error("Não encontramos o conteúdo principal do documento.");
   const paragraphText=(el:Element)=>{let out="";const walk=(node:Node)=>{if(node.nodeType===Node.TEXT_NODE||node.nodeType!==Node.ELEMENT_NODE)return;const element=node as Element;if(element.namespaceURI===w&&element.localName==="t"){out+=element.textContent||"";return;}if(element.namespaceURI===w&&element.localName==="tab"){out+=" | ";return;}if(element.namespaceURI===w&&element.localName==="br"){out+=" ";return;}for(const child of Array.from(node.childNodes))walk(child);};walk(el);return clean(out);};
   const lines:string[]=[];
   for(const block of Array.from(body.children)){
    if(block.localName==="p"){const value=paragraphText(block);if(value)lines.push(value);}
    else if(block.localName==="tbl"){
     const rows=Array.from(block.getElementsByTagNameNS(w,"tr"));
     for(const row of rows){const cells=Array.from(row.children).filter(x=>x.localName==="tc").map(cell=>Array.from(cell.getElementsByTagNameNS(w,"p")).map(paragraphText).filter(Boolean).join(" ")).filter(Boolean);if(cells.length)lines.push(cells.join(" | "));}
    }
   }
   return lines.join("\n");
  }
  p+=46+nameLen+extra+comment;
 }
 throw new Error("O arquivo não contém texto reconhecível.");
}
function pdfText(raw:string){const chunks=[...raw.matchAll(/\(([^()]*(?:\.[^()]*)*)\)\s*Tj/g)].map(x=>clean(x[1].replace(/\\([()\\])/g,"$1").replace(/\\n/g," "))).filter(Boolean);return chunks.join("\n");}
function structure(raw:string):ResumeData{
 const lines=raw.split(/\r?\n/).map(clean).filter(Boolean),all=lines.join("\n");
 const email=all.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0]||"";
 const phone=all.match(/(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?9?\d{4}[-. ]?\d{4}/)?.[0]||"";
 const headerCells=(lines[0]||"").split(/\s*\|\s*/).map(clean);const name=headerCells[0]||lines.find(x=>x.length>4&&x.length<65&&!/@|\d{5}/.test(x))||"";
 const normalize=(x:string)=>x.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/:$/,"").trim();
 const headings=["experiencia profissional","experiencias profissionais","experiencia","historico profissional","formacao academica","formacao","educacao","habilidades","competencias","qualificacoes","cursos e certificacoes","cursos","certificacoes","idiomas","objetivo profissional","objetivo","resumo profissional","perfil profissional"];
 const isHeading=(x:string)=>headings.includes(normalize(x));
 const section=(names:string[])=>{const wanted=names.map(normalize),start=lines.findIndex(x=>wanted.includes(normalize(x)));if(start<0)return[];const out:string[]=[];for(let i=start+1;i<lines.length;i++){if(isHeading(lines[i]))break;out.push(lines[i]);}return out;};
 const expLines=section(["experiência profissional","experiências profissionais","experiência","histórico profissional"]);
 const experiences:ResumeData["experiences"]=[];
 for(let i=0;i<expLines.length;){
  const company=expLines[i];const detail=expLines[i+1]||"";
  const parts=detail.split(/\s{2,}|\s(?=[A-Z][a-záéíóúãõç]+\s+de\s+\d{4})/).map(clean).filter(Boolean);
  const dateStart=detail.search(/\\b(?:janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\\.?\\s*(?:de\\s*)?\\d{4}|\\b\\d{1,2}\\/\\d{4}/i);
  let title=detail,period="";
  if(dateStart>=0){title=clean(detail.slice(0,dateStart));period=clean(detail.slice(dateStart));}
  experiences.push({id:"imp"+experiences.length,title:title||company,subtitle:title?company:"",period,description:""});
  i+=detail?2:1;
 }
 const parseRows=(rows:string[],prefix:string)=>rows.map((row,i)=>{const cells=row.split(/\s*\|\s*/).map(clean).filter(Boolean);return{id:prefix+i,title:cells[1]||cells[0]||row,subtitle:cells[0]&&cells[1]?cells[0]:"",period:cells.slice(2).join(" · "),description:""};});
 const education=parseRows(section(["formação acadêmica","formação","educação"]),"edu");
 const courseRows=section(["cursos e certificações","cursos","certificações"]);
 const courses=courseRows.map(row=>row.split(/\s*\|\s*/).map(clean).filter(Boolean).filter(x=>!/^conclu[ií]do?s?$/i.test(x)).join(" — ")).filter(Boolean);
 const qualification=section(["qualificações","habilidades","competências"]);
 const skills=qualification.flatMap(x=>x.replace(/^[•▪●\-]\s*/,"").split(/[;|]/)).map(clean).filter(x=>x.length>1);
 const objective=section(["objetivo profissional","objetivo","resumo profissional","perfil profissional"]).join(" ");
 const language=section(["idiomas"]).map(clean);
 const role=headerCells[1]||lines.find(x=>x!==name&&!x.includes("@")&&!/^\(?\d/.test(x)&&x.length<90&&!isHeading(x))?.split("|")[0].trim()||"";
 return{name,role,email,phone,city:"",summary:objective,photo:"",experiences,education,courses,skills,languages:language};
}
export default function ImportResumePage(){const router=useRouter();const [raw,setRaw]=useState(""),[fileName,setFileName]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false),[overrides,setOverrides]=useState<Partial<ResumeData>>({});const cv=useMemo(()=>({...structure(raw),...overrides}),[raw,overrides]);const onFile=async(file?:File)=>{if(!file)return;setError("");setBusy(true);setFileName(file.name);try{if(file.size>8*1024*1024)throw new Error("O arquivo deve ter no máximo 8 MB.");let text="";if(file.name.toLowerCase().endsWith(".docx"))text=await docxText(file);else if(file.name.toLowerCase().endsWith(".pdf")){const bytes=await file.arrayBuffer();text=pdfText(new TextDecoder("latin1").decode(bytes));if(text.length<40)throw new Error("Este PDF parece estar digitalizado ou usa texto compactado. Copie o texto do PDF e cole no campo abaixo.");}else if(file.name.toLowerCase().endsWith(".txt"))text=await file.text();else throw new Error("Envie um arquivo PDF, DOCX ou TXT.");if(text.length<30)throw new Error("Não encontramos texto suficiente. Tente outro arquivo ou cole o conteúdo manualmente.");setOverrides({});setRaw(text);}catch(e){setError(e instanceof Error?e.message:"Não foi possível ler o arquivo.");}finally{setBusy(false);}};const update=(key:keyof ResumeData,value:string)=>{setOverrides(current=>({...current,[key]:value}));};const create=()=>{try{const doc=createResume("blank");doc.title="Importado — "+(cv.name||"Meu currículo");doc.cv=cv;const docs=JSON.parse(localStorage.getItem(RESUME_LIBRARY_KEY)||"[]") as ResumeDocument[];localStorage.setItem(RESUME_LIBRARY_KEY,JSON.stringify([doc,...docs]));localStorage.setItem(ACTIVE_RESUME_KEY,doc.id);router.push("/editor");}catch{setError("Não foi possível salvar o currículo neste navegador. Verifique o espaço disponível.");}};return <main className="importPage"><div className="importWrap"><a href="/" className="importBack">← Voltar ao início</a><span className="importEyebrow">IMPORTAÇÃO ASSISTIDA</span><h1>Traga seu currículo para o CurrículosPRO.</h1><p className="importLead">Envie um PDF, DOCX ou TXT. Vamos identificar algumas informações para você revisar antes de criar uma nova versão.</p><section className="importUpload"><label htmlFor="resume-file">Selecionar arquivo do currículo</label><input id="resume-file" type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" onChange={e=>onFile(e.target.files?.[0])}/><small>Máximo de 8 MB. O arquivo é processado localmente neste navegador e não é enviado para um servidor.</small>{fileName&&<b className="importFile">Arquivo: {fileName}</b>}</section><div className="importOr">OU COLE O TEXTO DO SEU CURRÍCULO</div><textarea className="importText" value={raw} onChange={e=>{setOverrides({});setRaw(e.target.value)}} placeholder="Cole aqui o texto copiado do seu PDF ou documento Word..." rows={9}/>{error&&<p className="importError" role="alert">{error}</p>}{busy&&<p className="importStatus">Lendo seu documento…</p>}{raw.length>=30&&<section className="importReview"><div className="importReviewHead"><span>ETAPA 2</span><h2>Confira o que identificamos</h2><p>A leitura automática é uma ajuda inicial. Revise e corrija os campos no editor depois da importação.</p></div><div className="importFields"><label>Nome<input value={cv.name} onChange={e=>update("name",e.target.value)}/></label><label>Título profissional<input value={cv.role} onChange={e=>update("role",e.target.value)}/></label><label>E-mail<input value={cv.email} onChange={e=>update("email",e.target.value)}/></label><label>Telefone<input value={cv.phone} onChange={e=>update("phone",e.target.value)}/></label><label>Cidade<input value={cv.city} onChange={e=>update("city",e.target.value)}/></label><label>Objetivo / resumo<textarea value={cv.summary} onChange={e=>update("summary",e.target.value)} rows={3}/></label></div><div className="importDetected"><b>Também tentaremos organizar</b><span>{cv.experiences.length} linhas de experiência · {cv.education.length} linhas de formação · {cv.skills.length} qualificações · {cv.courses.length} cursos · {cv.languages.length} idiomas</span><small>Esses itens poderão ser ajustados no editor. A importação não inventa empresa, período ou resultados.</small></div><button className="importCreate" onClick={create}>Criar uma nova versão no editor →</button><small className="importPreserve">Seus currículos anteriores não serão substituídos. O documento original não é armazenado pelo CurrículosPRO.</small></section>}</div></main>;}
