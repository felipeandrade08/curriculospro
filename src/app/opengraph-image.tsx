import { ImageResponse } from "next/og";
import { ACCESS_PRICE_LABEL } from "@/lib/billing";

export const alt = "CurriculosPRO — Crie seu currículo profissional online";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "linear-gradient(135deg, #0a2f63 0%, #087cf0 100%)",
        padding: 72,
        fontFamily: "sans-serif",
        color: "white",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 640 }}>
        <div style={{ display: "flex", fontSize: 34, fontWeight: 800 }}>
          Curriculos<span style={{ color: "#8fd0ff" }}>PRO</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 66, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
            Seu currículo merece abrir portas.
          </div>
          <div style={{ fontSize: 28, marginTop: 24, color: "#d5e9ff", lineHeight: 1.4 }}>
            Editor guiado, modelos modernos e PDF pronto para enviar.
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, fontSize: 24, fontWeight: 700 }}>
          <span style={{ background: "rgba(255,255,255,0.16)", padding: "10px 18px", borderRadius: 999 }}>
            Crie grátis
          </span>
          <span style={{ background: "rgba(255,255,255,0.16)", padding: "10px 18px", borderRadius: 999 }}>
            PDF por {ACCESS_PRICE_LABEL}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "flex-end" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 330,
            height: 440,
            background: "white",
            borderRadius: 14,
            padding: 34,
            transform: "rotate(3deg)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 800, color: "#14213d" }}>Mariana Costa</div>
          <div style={{ fontSize: 16, color: "#087cf0", marginTop: 6, fontWeight: 700 }}>
            Analista de Marketing
          </div>
          <div style={{ height: 3, background: "#087cf0", marginTop: 20, marginBottom: 22, width: 90 }} />
          {[260, 220, 240, 180, 250, 200, 230, 160].map((w, i) => (
            <div
              key={i}
              style={{
                height: i % 3 === 0 ? 10 : 8,
                width: w,
                background: i % 3 === 0 ? "#c9dcf2" : "#e8eef5",
                borderRadius: 6,
                marginBottom: i % 3 === 2 ? 22 : 12,
              }}
            />
          ))}
        </div>
      </div>
    </div>,
    size,
  );
}
