import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

const STATS = [
  { value: "2.4M+", label: "Leads capturados", color: "#7B2FF2", emoji: "📍" },
  { value: "890K+", label: "Mensagens enviadas", color: "#F7941D", emoji: "💬" },
  { value: "23x", label: "ROI médio", color: "#00B4D8", emoji: "📈" },
  { value: "48h", label: "Até 1ª reunião", color: "#E91E8C", emoji: "⏱️" },
];

export const Scene2Stats = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const titleY = interpolate(
    spring({ frame, fps, config: { damping: 20 } }),
    [0, 1], [50, 0]
  );

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 60 }}>
      <div
        style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          fontSize: 48,
          fontWeight: 800,
          color: "white",
          textAlign: "center",
          marginBottom: 80,
          letterSpacing: -1,
        }}
      >
        Resultados que{" "}
        <span style={{ color: "#7B2FF2" }}>falam sozinhos</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 30, width: "100%" }}>
        {STATS.map((stat, i) => {
          const delay = 20 + i * 15;
          const s = spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 150 } });
          const op = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
          const x = interpolate(s, [0, 1], [i % 2 === 0 ? -200 : 200, 0]);

          // Counter animation
          const numMatch = stat.value.match(/[\d.]+/);
          const numVal = numMatch ? parseFloat(numMatch[0].replace(".", "")) : 0;
          const countProgress = interpolate(frame, [delay, delay + 40], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
          const currentNum = Math.floor(numVal * countProgress);
          const suffix = stat.value.replace(/[\d.]+/, "");
          const displayVal = numVal > 100
            ? (currentNum > 999 ? `${(currentNum / 1000).toFixed(1)}M+`.replace(".0M", "M") : `${currentNum}K+`)
            : `${currentNum}${suffix}`;

          return (
            <div
              key={i}
              style={{
                opacity: op,
                transform: `translateX(${x}px)`,
                background: "rgba(255,255,255,0.05)",
                borderRadius: 24,
                padding: "36px 40px",
                display: "flex",
                alignItems: "center",
                gap: 24,
                border: `1px solid ${stat.color}30`,
              }}
            >
              <span style={{ fontSize: 48 }}>{stat.emoji}</span>
              <div>
                <div style={{ fontSize: 56, fontWeight: 800, color: stat.color, letterSpacing: -2 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 26, color: "rgba(255,255,255,0.6)", fontWeight: 500, marginTop: 4 }}>
                  {stat.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
