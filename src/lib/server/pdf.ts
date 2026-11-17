// PDF de verdade, gerado no servidor com um Chrome sem tela: abre a página /pdf-render
// com o currículo e imprime em A4. Na Vercel usa o @sparticuz/chromium; no computador,
// o Chrome instalado (CHROME_PATH).
import type { ResumeDocument, ResumeSection } from "@/lib/resume";
import { defaultOrder } from "@/lib/resume";

type Browser = import("puppeteer-core").Browser;

async function launch(): Promise<Browser> {
  const puppeteer = (await import("puppeteer-core")).default;
  const local = process.env.CHROME_PATH?.trim();
  if (local || !process.env.VERCEL) {
    return puppeteer.launch({
      executablePath: local || "/usr/bin/google-chrome",
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"],
    });
  }
  const chromium = (await import("@sparticuz/chromium")).default;
  return puppeteer.launch({
    executablePath: await chromium.executablePath(),
    args: chromium.args,
    headless: true,
    defaultViewport: { width: 794, height: 1123 },
  });
}

/** Seções visíveis na ordem escolhida (o editor manda as dele; aqui é o padrão do documento). */
export function sectionsOf(doc: ResumeDocument): ResumeSection[] {
  const order = doc.sectionOrder.length ? doc.sectionOrder : defaultOrder;
  return order.filter((s) => !doc.hidden.includes(s));
}

export async function renderResumePdf(
  baseUrl: string,
  doc: ResumeDocument,
  opts: { sections?: ResumeSection[]; scale?: number | "auto" } = {},
): Promise<Uint8Array> {
  const job = { doc, sections: opts.sections?.length ? opts.sections : sectionsOf(doc), scale: opts.scale ?? "auto" };
  const browser = await launch();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123 });
    // Antes do site carregar: entrega o currículo e desliga aviso de cookies e medições.
    await page.evaluateOnNewDocument((value) => {
      (window as unknown as { __PDF_JOB__: unknown }).__PDF_JOB__ = value;
      try {
        localStorage.setItem("curriculospro.consent.v1", "denied");
        localStorage.setItem("curriculospro.team.v1", "1");
      } catch {}
    }, job);
    await page.goto(baseUrl.replace(/\/+$/, "") + "/pdf-render", { waitUntil: "networkidle0", timeout: 25000 });
    await page.waitForFunction("window.__PDF_READY__ === true", { timeout: 15000 });
    // Deixa na página só o currículo (sem botão de suporte, avisos etc.).
    await page.evaluate(() => {
      const root = document.getElementById("pdf-root");
      if (root) document.body.replaceChildren(root);
      document.body.style.margin = "0";
      // Currículo de mais de uma página: margem em cima e embaixo a partir da 2ª folha,
      // para o texto não encostar na borda do papel.
      const cv = document.querySelector<HTMLElement>(".pdfRender .cv");
      if (cv && cv.scrollHeight > 1128) {
        const style = document.createElement("style");
        style.textContent =
          "@page{size:A4;margin:14mm 0 12mm}@page:first{margin-top:0}" +
          "@media print{.pdfRender .cv{min-height:0!important}}";
        document.head.appendChild(style);
      }
    });
    const pdf = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true });
    return new Uint8Array(pdf);
  } finally {
    await browser.close().catch(() => {});
  }
}

/** Endereço do próprio site para o Chrome abrir a página de impressão. */
export function renderBaseUrl(request?: Request) {
  const configured = (process.env.PDF_RENDER_URL || process.env.SITE_URL || "").trim();
  if (configured) return configured;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (request) return new URL(request.url).origin;
  return "http://localhost:" + (process.env.PORT || 3000);
}
