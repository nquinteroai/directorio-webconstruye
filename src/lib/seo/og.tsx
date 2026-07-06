import { ImageResponse } from "next/og";

export const TAMANO_OG = { width: 1200, height: 630 };

/**
 * Plantilla base de las imágenes Open Graph: papel cálido, franja de toldo
 * (la firma visual del directorio) y tipografía grande. Sin fuentes externas
 * para que la generación sea robusta en build y en runtime.
 */
export function imagenOg({
  titulo,
  subtitulo,
  etiqueta,
}: {
  titulo: string;
  subtitulo?: string;
  etiqueta?: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#FDFBF8",
          fontFamily: "sans-serif",
        }}
      >
        {/* Franja de toldo superior */}
        <div
          style={{
            height: 28,
            width: "100%",
            backgroundImage:
              "repeating-linear-gradient(-45deg, #96500F 0 26px, #C97B2E 26px 52px)",
          }}
        />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 88px",
          }}
        >
          {etiqueta ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 28,
              }}
            >
              <div
                style={{
                  backgroundColor: "#F3E8D8",
                  color: "#96500F",
                  fontSize: 30,
                  fontWeight: 700,
                  padding: "10px 28px",
                  borderRadius: 999,
                }}
              >
                {etiqueta}
              </div>
            </div>
          ) : null}

          <div
            style={{
              fontSize: titulo.length > 32 ? 68 : 84,
              fontWeight: 800,
              color: "#2B221B",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              maxWidth: 1020,
            }}
          >
            {titulo}
          </div>

          {subtitulo ? (
            <div
              style={{
                marginTop: 24,
                fontSize: 36,
                color: "#79695C",
                maxWidth: 980,
              }}
            >
              {subtitulo}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 88px 52px",
          }}
        >
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: "#2B221B" }}>
            Directorio{" "}
            <span style={{ color: "#96500F", marginLeft: 10 }}>Webconstruye</span>
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#79695C" }}>
            📍 Kennedy · Soacha
          </div>
        </div>
      </div>
    ),
    TAMANO_OG,
  );
}
