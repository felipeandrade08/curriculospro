import { ImageResponse } from "next/og";
import { loadDelivery, verifyDeliveryToken } from "@/lib/server/delivery";

export const runtime = "nodejs";
export const alt = "Seu currículo está pronto";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Prévia do link no WhatsApp: cartão com o nome da pessoa e uma folha de currículo. */
export default async function Image({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const check = verifyDeliveryToken(token);
  const delivery = "id" in check ? await loadDelivery(check.id).catch(() => null) : null;
  const first = delivery?.name.trim().split(/\s+/)[0] || "";
  const accent = delivery?.resume.accent || "#1553d6";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #0f2a4a 0%, #1553d6 100%)",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, color: "#fff" }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              background: "#ffe066",
              color: "#0e1b2e",
              fontSize: 26,
              fontWeight: 800,
              padding: "8px 20px",
              borderRadius: 999,
            }}
          >
            Pronto para baixar
          </div>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 800, lineHeight: 1.05, marginTop: 28 }}>
            {first ? `${first}, seu currículo está pronto` : "Seu currículo está pronto"}
          </div>
          <div style={{ display: "flex", fontSize: 30, marginTop: 22, opacity: 0.9 }}>
            PDF e Word · feito pela equipe CurriculosPRO
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 330,
            height: 470,
            marginLeft: 48,
            alignSelf: "center",
            background: "#fff",
            borderRadius: 12,
            padding: 30,
            transform: "rotate(3deg)",
            boxShadow: "0 30px 60px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ display: "flex", height: 26, width: 210, background: "#0e1b2e", borderRadius: 6 }} />
          <div style={{ display: "flex", height: 14, width: 150, background: accent, borderRadius: 6, marginTop: 14 }} />
          {[0, 1, 2].map((block) => (
            <div key={block} style={{ display: "flex", flexDirection: "column", marginTop: 30 }}>
              <div style={{ display: "flex", height: 12, width: 110, background: accent, borderRadius: 6 }} />
              {[250, 270, 200].map((w, i) => (
                <div
                  key={i}
                  style={{ display: "flex", height: 9, width: w, background: "#d8dee8", borderRadius: 5, marginTop: 12 }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
