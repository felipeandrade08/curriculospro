// Extrai linhas de texto de um PDF respeitando a posição visual: junta itens da mesma
// linha, separa blocos distantes com " | " e lê layouts de duas colunas coluna a coluna.
// Recebe o módulo do pdf.js por parâmetro para funcionar no navegador e nos testes.
import { isSectionHeading } from "./parse";

export type TextLine = { text: string; size: number; page: number };

type Item = { str: string; x: number; y: number; w: number; size: number };
type Segment = { text: string; x0: number; x1: number; y: number; size: number };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PdfJs = { getDocument: (src: any) => { promise: Promise<any> } };

export async function pdfToLines(pdfjs: PdfJs, data: ArrayBuffer | Uint8Array): Promise<TextLine[]> {
  const doc = await pdfjs.getDocument({
    data: data instanceof Uint8Array ? data : new Uint8Array(data),
    isEvalSupported: false,
    useSystemFonts: false,
  }).promise;
  const out: TextLine[] = [];
  const pages = Math.min(doc.numPages, 6);
  for (let n = 1; n <= pages; n++) {
    const page = await doc.getPage(n);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: Item[] = (content.items as any[])
      .filter((it) => typeof it.str === "string" && it.str.length > 0)
      .map((it) => {
        const [a, b, , , e, f] = it.transform as number[];
        const size = Math.max(1, Math.hypot(a, b) || it.height || 10);
        return { str: despaceItem(it.str), x: e, y: f, w: it.width || 0, size };
      });
    for (const line of pageLines(items, viewport.width)) out.push({ ...line, page: n });
  }
  return out;
}

function pageLines(items: Item[], pageWidth: number): Omit<TextLine, "page">[] {
  if (!items.length) return [];
  // 1. Linhas visuais: itens com a mesma altura (y) com tolerância proporcional à fonte.
  const sorted = [...items].sort((p, q) => q.y - p.y || p.x - q.x);
  const rows: Item[][] = [];
  for (const it of sorted) {
    const row = rows.find((r) => Math.abs(r[0].y - it.y) <= Math.max(2, Math.min(r[0].size, it.size) * 0.45));
    if (row) row.push(it);
    else rows.push([it]);
  }
  rows.sort((p, q) => q[0].y - p[0].y);

  // 2. Segmentos: itens próximos na mesma linha formam um texto contínuo.
  const segments: Segment[][] = rows.map((row) => {
    row.sort((p, q) => p.x - q.x);
    const segs: Segment[] = [];
    let cur: Segment | null = null;
    for (const it of row) {
      if (!it.str.trim()) {
        // Espaço "largo" (entre etiquetas ou colunas) separa blocos; espaço normal só separa palavras.
        if (cur && it.w > it.size * 1.2) cur = null;
        else if (cur) {
          cur.text += " ";
          cur.x1 = Math.max(cur.x1, it.x + it.w);
        }
        continue;
      }
      const gap = cur ? it.x - cur.x1 : 0;
      if (!cur || gap > Math.max(it.size * 1.6, 14)) {
        cur = { text: it.str, x0: it.x, x1: it.x + it.w, y: it.y, size: it.size };
        segs.push(cur);
      } else {
        const needsSpace = gap > it.size * 0.22 && !/\s$/.test(cur.text) && !/^\s/.test(it.str);
        cur.text += (needsSpace ? " " : "") + it.str;
        cur.x1 = Math.max(cur.x1, it.x + it.w);
        cur.size = Math.max(cur.size, it.size);
      }
    }
    return segs.map((s) => ({ ...s, text: s.text.replace(/\s+/g, " ").trim() })).filter((s) => s.text);
  });

  const all = segments.flat();
  const gutter = findGutter(all, pageWidth);
  const lines: Omit<TextLine, "page">[] = [];
  const emit = (rowSegs: Segment[][]) => {
    for (const block of gridBlocks(rowSegs)) {
      for (const segs of block) {
        if (!segs.length) continue;
        lines.push({ text: segs.map((s) => s.text).join(" | "), size: Math.max(...segs.map((s) => s.size)) });
      }
    }
  };
  if (gutter === null) {
    emit(segments);
  } else {
    const left = segments.map((r) =>
      r.filter((s) => s.x1 <= gutter + 2 || (s.x0 < gutter - 2 && s.x1 > gutter + 2)),
    );
    const right = segments.map((r) =>
      r.filter((s) => s.x0 >= gutter - 2 && s.x1 > gutter + 2 && !(s.x0 < gutter - 2)),
    );
    const leftRows = left.filter((r) => r.length);
    const rightRows = right.filter((r) => r.length);
    const aligned = left.filter((r, i) => r.length && right[i].length).length;
    // Itens alinhados à direita na mesma linha (datas, por exemplo) não formam uma coluna:
    // numa coluna lateral de verdade, quase nenhuma linha é dividida com o conteúdo principal.
    const sharedRows = aligned / Math.max(1, Math.min(leftRows.length, rightRows.length));
    const leftChars = leftRows.reduce((n, r) => n + r.reduce((m, s) => m + s.text.length, 0), 0);
    // Junta títulos quebrados em duas linhas para conferir se a coluna é só de títulos.
    const leftTexts: string[] = [];
    let prevY = Infinity;
    for (const r of leftRows) {
      const t = r.map((x) => x.text).join(" ");
      if (leftTexts.length && prevY - r[0].y < r[0].size * 1.7) leftTexts[leftTexts.length - 1] += " " + t;
      else leftTexts.push(t);
      prevY = r[0].y;
    }
    const headingShare = leftTexts.filter(isSectionHeading).length / Math.max(1, leftTexts.length);
    const labelColumn =
      leftRows.length > 0 &&
      aligned / leftRows.length >= 0.5 &&
      leftChars / leftRows.length < 28 &&
      headingShare >= 0.5;
    const rightSegs = rightRows.flat();
    const spread = (v: number[]) => (v.length ? Math.max(...v) - Math.min(...v) : 0);
    const rightAligned = spread(rightSegs.map((x) => x.x1)) + 4 < spread(rightSegs.map((x) => x.x0)) * 0.5;
    // Numa coluna de verdade, a maior parte das linhas começa na mesma margem esquerda.
    const marginShare = (segs: Segment[]) => {
      if (!segs.length) return 0;
      const min = Math.min(...segs.map((x) => x.x0));
      return segs.filter((x) => x.x0 - min <= 26).length / segs.length;
    };
    const leftSegs = leftRows.flat().filter((x) => x.x1 <= gutter + 2);
    const realColumns = marginShare(rightSegs) >= 0.6 && marginShare(leftSegs) >= 0.6;
    if (!labelColumn && (!realColumns || (sharedRows > 0.5 && rightAligned))) {
      emit(segments);
    } else if (labelColumn) {
      // Coluna de títulos (ex.: "EXPERIÊNCIA" ao lado do conteúdo): intercala por altura,
      // unindo títulos quebrados em duas linhas.
      type Out = { y: number; order: number; text: string; size: number };
      const outs: Out[] = [];
      let run: Out | null = null;
      let lastY = 0;
      left.forEach((r, i) => {
        if (!r.length) return;
        const y = r[0].y,
          size = Math.max(...r.map((s) => s.size));
        const text = r.map((s) => s.text).join(" ");
        if (run && lastY - y < size * 1.7) run.text += " " + text;
        else {
          run = { y, order: i * 2, text, size };
          outs.push(run);
        }
        lastY = y;
      });
      // Conteúdo da direita, lendo grades (cursos lado a lado) coluna por coluna.
      const rightIdx = right.map((r, i) => (r.length ? i : -1)).filter((i) => i >= 0);
      const rightRowsOnly = rightIdx.map((i) => right[i]);
      let k = 0;
      for (const block of gridBlocks(rightRowsOnly)) {
        const baseRow = rightIdx[k] ?? rightIdx[rightIdx.length - 1];
        const segCount = block.reduce((n, segs) => n + segs.length, 0);
        const rowsUsed =
          block.length === 1
            ? 1
            : Math.max(1, Math.round(segCount / Math.max(1, rightRowsOnly[k]?.length || 1)));
        block.forEach((segs, j) => {
          if (!segs.length) return;
          outs.push({
            y: segs[0].y,
            order: baseRow * 2 + 1 + j * 0.001,
            text: segs.map((s) => s.text).join(" | "),
            size: Math.max(...segs.map((s) => s.size)),
          });
        });
        k += rowsUsed;
      }
      outs.sort((p, q) => p.order - q.order);
      for (const o of outs) lines.push({ text: o.text, size: o.size });
    } else {
      // Duas colunas: primeiro o que atravessa a página (cabeçalho), depois esquerda, depois direita.
      emit(left);
      emit(right);
    }
  }
  return lines;
}

/** Procura uma faixa vertical vazia que divide a página em duas colunas com bastante texto. */
function findGutter(segs: Segment[], pageWidth: number): number | null {
  if (segs.length < 14) return null;
  const totalChars = segs.reduce((n, s) => n + s.text.length, 0);
  let best: { g: number; cross: number; balance: number } | null = null;
  for (let g = pageWidth * 0.2; g <= pageWidth * 0.8; g += 3) {
    let cross = 0,
      leftChars = 0,
      rightChars = 0,
      leftCount = 0,
      rightCount = 0;
    for (const s of segs) {
      if (s.x0 < g - 2 && s.x1 > g + 2) cross++;
      else if (s.x1 <= g + 2) {
        leftChars += s.text.length;
        leftCount++;
      } else {
        rightChars += s.text.length;
        rightCount++;
      }
    }
    const balance = Math.min(leftChars, rightChars) / totalChars;
    if (leftCount < 6 || rightCount < 6 || balance < 0.12) continue;
    if (!best || cross < best.cross || (cross === best.cross && balance > best.balance))
      best = { g, cross, balance };
  }
  if (!best) return null;
  return best.cross <= Math.max(2, Math.round(segs.length * 0.04)) ? best.g : null;
}

/**
 * Linhas consecutivas com vários blocos alinhados (grades de cursos, por exemplo) são lidas
 * coluna por coluna, para que título e instituição de cada item fiquem juntos.
 */
function gridBlocks(rows: Segment[][]): Segment[][][] {
  const blocks: Segment[][][] = [];
  let i = 0;
  while (i < rows.length) {
    const row = rows[i];
    if (row.length >= 2) {
      let j = i + 1;
      while (
        j < rows.length &&
        rows[j].length === row.length &&
        rows[j].every((s, k) => Math.abs(s.x0 - row[k].x0) <= 3) &&
        Math.abs(rows[j - 1][0].y - rows[j][0].y) < row[0].size * 2.6
      )
        j++;
      if (j - i >= 2) {
        const cols: Segment[][] = [];
        for (let k = 0; k < row.length; k++) for (let r = i; r < j; r++) cols.push([rows[r][k]]);
        blocks.push(cols);
        i = j;
        continue;
      }
    }
    blocks.push([row]);
    i++;
  }
  return blocks;
}

/** Texto com espaçamento entre letras chega como "O B J E T I VO": junta as letras da palavra. */
function despaceItem(str: string) {
  const tokens = str.trim().split(" ");
  const singles = tokens.filter((t) => t.length === 1).length;
  if (
    (tokens.length >= 3 && singles / tokens.length >= 0.6) ||
    (tokens.length >= 2 && singles === tokens.length)
  )
    return str.replace(/(\S) (?=\S)/g, "$1");
  return str;
}
