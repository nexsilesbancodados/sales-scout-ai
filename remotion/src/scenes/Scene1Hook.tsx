import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const Scene1Hook = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const iconScale = spring({ frame, fps, config: { damping: 12, stiffness: 150 } });
  const titleY = interpolate(
    spring({ frame: frame - 15, fps, config: { damping: 20, stiffness: 180 } }),
    [0, 1], [80, 0]
  );
  const titleOp = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const subY = interpolate(
    spring({ frame: frame - 35, fps, config: { damping: 20, stiffness: 180 } }),
    [0, 1], [60, 0]
  );
  const subOp = interpolate(frame, [35, 55], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // Pulsing ring
  const ringScale = 1 + Math.sin(frame * 0.08) * 0.05;
  const ringOp = interpolate(frame, [0, 20], [0, 0.6], { extrapolateRight: "clamp" });

  // Particle dots
  const particles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2 + frame * 0.02;
    const radius = 280 + Math.sin(frame * 0.03 + i) * 30;
    return {
      x: 540 + Math.cos(angle) * radius,
      y: 800 + Math.sin(angle) * radius,
      op: interpolate(frame, [i * 3, i * 3 + 20], [0, 0.5], { extrapolateRight: "clamp", extrapolateLeft: "clamp" }),
    };
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: i % 2 === 0 ? "#7B2FF2" : "#F7941D",
            opacity: p.op,
          }}
        />
      ))}

      {/* Pulsing ring */}
      <div
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          border: "2px solid rgba(123,47,242,0.3)",
          transform: `scale(${ringScale})`,
          opacity: ringOp,
        }}
      />

      {/* Icon */}
      <div
        style={{
          width: 140,
          height: 140,
          borderRadius: 36,
          background: "linear-gradient(135deg, #7B2FF2, #5B1FD2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${iconScale})`,
          boxShadow: "0 20px 60px rgba(123,47,242,0.4)",
          marginBottom: 60,
        }}
      >
        <span style={{ fontSize: 64, color: "white" }}>🚀</span>
      </div>

      {/* Title */}
      <div
        style={{
          transform: `translateY(${titleY}px)`,
          opacity: titleOp,
          textAlign: "center",
          padding: "0 60px",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "white",
            lineHeight: 1.1,
            letterSpacing: -2,
          }}
        >
          Seus clientes estão{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #7B2FF2, #F7941D)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            no Google Maps
          </span>
        </div>
      </div>

      {/* Subtitle */}
      <div
        style={{
          transform: `translateY(${subY}px)`,
          opacity: subOp,
          textAlign: "center",
          padding: "0 80px",
          marginTop: 30,
        }}
      >
        <div style={{ fontSize: 36, color: "rgba(255,255,255,0.7)", lineHeight: 1.4, fontWeight: 500 }}>
          A IA captura, envia mensagem e agenda reuniões —{" "}
          <span style={{ color: "#F7941D", fontWeight: 700 }}>no automático</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
