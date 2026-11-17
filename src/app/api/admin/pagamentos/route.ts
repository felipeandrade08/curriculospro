import { checkAdmin } from "@/lib/server/admin";
import { db } from "@/lib/server/db";
import { channelOf, type SaleSource } from "@/lib/server/sales-source";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

// Planilha (CSV, separador ;) com os pagamentos do período, para abrir no Excel.
export async function GET(request: Request) {
  const check = await checkAdmin();
  if (!check.ok) return new Response("Acesso restrito.", { status: 403 });
  const days = Math.min(365, Math.max(1, Number(new URL(request.url).searchParams.get("dias")) || 30));
  const rows =
    await db()`SELECT p.id, u.email, p.amount_cents, p.status, p.revoked_at IS NOT NULL AS estornado, p.plan, p.source,
      to_char(p.created_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') AS criado,
      to_char(p.approved_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI') AS aprovado
    FROM payments p JOIN app_users u ON u.id = p.user_id
    WHERE p.created_at >= now() - make_interval(days => ${days})
    ORDER BY p.created_at DESC`;
  const lines = [
    ["ID Mercado Pago", "E-mail", "Valor", "Status", "Estornado", "Criado em", "Aprovado em", "Pacote", "Origem", "Campanha"].join(";"),
    ...rows.map((r) =>
      [
        r.id,
        r.email,
        (Number(r.amount_cents) / 100).toFixed(2).replace(".", ","),
        r.status,
        r.estornado ? "sim" : "não",
        r.criado,
        r.aprovado,
        r.plan === "mes" ? "Kit Emprego" : r.plan === "upgrade" ? "Upgrade" : "Currículo",
        channelOf(r.source as SaleSource | null),
        (r.source as SaleSource | null)?.campaign || "",
      ]
        .map(cell)
        .join(";"),
    ),
  ];
  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pagamentos-${days}dias.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
