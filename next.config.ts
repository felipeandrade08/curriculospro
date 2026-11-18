import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Regras que não quebram nada do site: sem plugins, sem <base> trocado, sem o site dentro de outro.
  { key: "Content-Security-Policy", value: "object-src 'none'; base-uri 'self'; frame-ancestors 'none'" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // A entrega do "Fazemos para você" envia o PDF pronto (até 4 MB) por uma server action.
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
  // PDF no servidor: o Chrome (@sparticuz/chromium) vai inteiro para a função, sem empacotar.
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  outputFileTracingIncludes: {
    "/api/export/pdf": ["./node_modules/@sparticuz/chromium/bin/**"],
    "/admin": ["./node_modules/@sparticuz/chromium/bin/**"],
    "/api/admin/pedido/[id]/entregar": ["./node_modules/@sparticuz/chromium/bin/**"],
    "/api/admin/pix/entregar": ["./node_modules/@sparticuz/chromium/bin/**"],
    "/api/entrega/[token]/pdf": ["./node_modules/@sparticuz/chromium/bin/**"],
  },
  async redirects() {
    return [{ source: "/apoie", destination: "/precos", permanent: true }];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
