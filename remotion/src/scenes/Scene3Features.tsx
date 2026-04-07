import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

const FEATURES = [
  { icon: "🔍", title: "Captura Inteligente", desc: "Google Maps, Instagram, Facebook", color: "#7B2FF2" },
  { icon: "🤖", title: "Agente SDR com IA", desc: "Prospecta e responde 24/7", color: "#F7941D" },
  { icon: "🛡️", title: "Anti-Ban Total", desc: "Zero bloqueios garantido", color: "#00B4D8" },
  { icon: "📊", title: "CRM + Analytics", desc: "Funil completo em tempo real", color: "#E91E8C" },
];

export const Scene3Features = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 60 }}>
      <div
        style={{
          opacity: titleOp,
          fontSize: 48,
          fontWeight: 800,
          color: "white",
          textAlign: "center",
          marginBottom: 60,
          letterSpacing: -1,
        }}
      >
        Tudo que você precisa.{"\n"}
        <span style={{ color: "#F7941D" }}>Nada que não precisa.</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%" }}>
        {FEATURES.map((f, i) => {
          const delay = 15 + i * 18;
          const s = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 160 } });
          const op = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
          const scale = interpolate(s, [0, 1], [0.8, 1]);
          const y = interpolate(s, [0, 1], [60, 0]);

          // Subtle float
          const float = Math.sin((frame - delay) * 0.04 + i) * 3;

          return (
            <div
              key={i}
              style={{
                opacity: op,
                transform: `translateY(${y + float}px) scale(${scale})`,
                background: `linear-gradient(135deg, ${f.color}15, ${f.color}08)`,
                borderRadius: 28,
                padding: "40px 36px",
                display: "flex",
                alignItems: "center",
                gap: 28,
                border: `1px solid ${f.color}40`,
                boxShadow: `0 8px 32px ${f.color}15`,
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 20,
                  background: `${f.color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 40,
                  flexShrink: 0,
                }}
              >
                {f.icon}
              </div>
              <div>
                <div style={{ fontSize: 32, fontWeight: 700, color: "white", marginBottom: 6 }}>
                  {f.title}
                </div>
                <div style={{ fontSize: 24, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>
                  {f.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
