// Leitura de arquivos de currículo no navegador (nada é enviado ao servidor).
import { pdfToLines } from "./pdf-lines";
import type { ImportLine } from "./parse";

export const MAX_IMPORT_BYTES = 8 * 1024 * 1024;

export class ImportError extends Error {}

export async function readResumeFile(file: File): Promise<ImportLine[]> {
  if (file.size > MAX_IMPORT_BYTES) throw new ImportError("O arquivo deve ter no máximo 8 MB.");
  const name = file.name.toLowerCase();
  let lines: ImportLine[];
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    lines = await readPdf(file);
    if (lines.map((l) => l.text).join("").length < 40)
      throw new ImportError(
        "Este PDF parece ser uma imagem digitalizada, sem texto para ler. Abra o arquivo, copie o texto e cole na caixa ao lado — ou comece por um exemplo da sua profissão.",
      );
  } else if (name.endsWith(".docx")) {
    lines = (await docxText(file)).split("\n").map((text) => ({ text }));
  } else if (name.endsWith(".txt") || file.type.startsWith("text/")) {
    lines = (await file.text()).split(/\r?\n/).map((text) => ({ text }));
  } else if (name.endsWith(".doc")) {
    throw new ImportError(
      "Arquivos .doc (Word antigo) não podem ser lidos. No Word, use Salvar como → .docx ou PDF e envie de novo.",
    );
  } else throw new ImportError("Envie um arquivo PDF, DOCX ou TXT.");
  if (
    lines
      .map((l) => l.text)
      .join("")
      .trim().length < 30
  )
    throw new ImportError("Não encontramos texto suficiente nesse arquivo. Tente outro ou cole o texto.");
  return lines;
}

async function readPdf(file: File) {
  // Build "legacy" funciona também em navegadores mais antigos de celular.
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = "/vendor/pdf.worker.min.mjs";
  try {
    return await pdfToLines(pdfjs, await file.arrayBuffer());
  } catch (e) {
    const msg = String((e as Error)?.message || e);
    if (/password/i.test(msg))
      throw new ImportError("Este PDF tem senha. Remova a proteção ou cole o texto do currículo.");
    throw new ImportError("Não conseguimos abrir este PDF. Tente exportá-lo de novo ou cole o texto.");
  }
}

const clean = (s: string) =>
  s
    .replace(/\u0000/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();

async function docxText(file: File) {
  const bytes = await file.arrayBuffer(),
    view = new DataView(bytes);
  let eocd = -1;
  for (let p = bytes.byteLength - 22; p >= Math.max(0, bytes.byteLength - 65558); p--) {
    if (view.getUint32(p, true) === 0x06054b50) {
      eocd = p;
      break;
    }
  }
  if (eocd < 0) throw new ImportError("Não foi possível ler este arquivo do Word.");
  const count = view.getUint16(eocd + 10, true);
  let p = view.getUint32(eocd + 16, true);
  for (let n = 0; n < count; n++) {
    if (view.getUint32(p, true) !== 0x02014b50) break;
    const method = view.getUint16(p + 10, true),
      compressed = view.getUint32(p + 20, true),
      nameLen = view.getUint16(p + 28, true),
      extra = view.getUint16(p + 30, true),
      comment = view.getUint16(p + 32, true),
      local = view.getUint32(p + 42, true),
      name = new TextDecoder().decode(new Uint8Array(bytes, p + 46, nameLen));
    if (name === "word/document.xml") {
      const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true),
        part = bytes.slice(start, start + compressed);
      let xml: string;
      if (method === 0) xml = new TextDecoder().decode(part);
      else if (method === 8) {
        const stream = new Blob([part])
          .stream()
          .pipeThrough(new DecompressionStream("deflate-raw" as CompressionFormat));
        xml = await new Response(stream).text();
      } else throw new ImportError("Formato de arquivo Word não suportado.");
      const parsed = new DOMParser().parseFromString(xml, "application/xml");
      if (parsed.querySelector("parsererror")) throw new ImportError("O arquivo do Word está corrompido.");
      const w = "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
        body = parsed.getElementsByTagNameNS(w, "body")[0];
      if (!body) throw new ImportError("Não encontramos o conteúdo do documento.");
      const paragraphText = (el: Element) => {
        let out = "";
        const walk = (node: Node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          const element = node as Element;
          if (element.namespaceURI === w && element.localName === "t") {
            out += element.textContent || "";
            return;
          }
          if (element.namespaceURI === w && element.localName === "tab") {
            out += " | ";
            return;
          }
          if (element.namespaceURI === w && element.localName === "br") {
            out += " ";
            return;
          }
          for (const child of Array.from(node.childNodes)) walk(child);
        };
        walk(el);
        const isBullet = el.getElementsByTagNameNS(w, "numPr").length > 0;
        const text = clean(out).replace(/^\|\s*/, "");
        return isBullet && text ? "• " + text : text;
      };
      const lines: string[] = [];
      const visit = (container: Element) => {
        for (const block of Array.from(container.children)) {
          if (block.localName === "p") {
            const value = paragraphText(block);
            if (value) lines.push(value);
          } else if (block.localName === "tbl") {
            for (const row of Array.from(block.getElementsByTagNameNS(w, "tr"))) {
              const cells = Array.from(row.children).filter((x) => x.localName === "tc");
              // Tabela de layout (2 colunas grandes): lê cada célula como um bloco.
              const paras = cells.map((c) =>
                Array.from(c.getElementsByTagNameNS(w, "p")).map(paragraphText).filter(Boolean),
              );
              if (paras.some((x) => x.length > 2)) paras.forEach((x) => lines.push(...x));
              else {
                const joined = paras.map((x) => x.join(" ")).filter(Boolean);
                if (joined.length) lines.push(joined.join(" | "));
              }
            }
          } else if (block.localName === "sdt") {
            const content = Array.from(block.children).find((x) => x.localName === "sdtContent");
            if (content) visit(content);
          }
        }
      };
      visit(body);
      return lines.join("\n");
    }
    p += 46 + nameLen + extra + comment;
  }
  throw new ImportError("O arquivo não contém texto reconhecível.");
}
