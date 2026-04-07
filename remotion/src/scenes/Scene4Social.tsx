import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const Scene4Social = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s1 = spring({ frame, fps, config: { damping: 18 } });
  const quoteOp = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const quoteY = interpolate(s1, [0, 1], [60, 0]);

  const s2 = spring({ frame: frame - 40, fps, config: { damping: 18 } });
  const priceOp = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const priceY = interpolate(s2, [0, 1], [50, 0]);

  // Stars animation
  const starsOp = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 60 }}>
      {/* Quote card */}
      <div
        style={{
          opacity: quoteOp,
          transform: `translateY(${quoteY}px)`,
          background: "rgba(255,255,255,0.06)",
          borderRadius: 32,
          padding: "50px 44px",
          border: "1px solid rgba(123,47,242,0.3)",
          marginBottom: 60,
          width: "100%",
        }}
      >
        {/* Stars */}
        <div style={{ opacity: starsOp, marginBottom: 20 }}>
          {[...Array(5)].map((_, i) => (
            <span key={i} style={{ fontSize: 36, marginRight: 4 }}>⭐</span>
          ))}
        </div>

        <div
          style={{
            fontSize: 34,
            color: "rgba(255,255,255,0.9)",
            lineHeight: 1.5,
            fontWeight: 500,
            fontStyle: "italic",
          }}
        >
          "Agendei 12 reuniões na primeira semana. O ROI já pagou 6 meses de assinatura."
        </div>
        <div style={{ marginTop: 24, fontSize: 24, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
          — Carlos, Agência Digital
        </div>
      </div>

      {/* Price */}
      <div
        style={{
          opacity: priceOp,
          transform: `translateY(${priceY}px)`,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 28, color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: 8 }}>
          Plano Profissional
        </div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 8 }}>
          <span style={{ fontSize: 36, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>R$</span>
          <span
            style={{
              fontSize: 96,
              fontWeight: 800,
              background: "linear-gradient(135deg, #7B2FF2, #F7941D)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: -3,
            }}
          >
            149
          </span>
          <span style={{ fontSize: 28, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>/mês</span>
        </div>
        <div style={{ fontSize: 24, color: "#00B4D8", fontWeight: 600, marginTop: 12 }}>
          Cancele quando quiser • Sem multa
        </div>
      </div>
    </AbsoluteFill>
  );
};
