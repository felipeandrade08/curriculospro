// Copia o worker do pdf.js para /public/vendor (usado pela importação de PDF no navegador).
import { copyFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const dest = path.join(root, "public", "vendor");
mkdirSync(dest, { recursive: true });
copyFileSync(
  path.join(root, "node_modules", "pdfjs-dist", "legacy", "build", "pdf.worker.min.mjs"),
  path.join(dest, "pdf.worker.min.mjs"),
);
console.log("pdf.js worker copied to public/vendor.");
