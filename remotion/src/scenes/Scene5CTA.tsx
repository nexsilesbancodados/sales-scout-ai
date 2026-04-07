import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const Scene5CTA = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s1 = spring({ frame, fps, config: { damping: 12, stiffness: 120 } });
  const mainOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const mainScale = interpolate(s1, [0, 1], [0.85, 1]);

  const s2 = spring({ frame: frame - 25, fps, config: { damping: 15 } });
  const btnOp = interpolate(frame, [25, 45], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const btnY = interpolate(s2, [0, 1], [40, 0]);

  // Pulsing glow on CTA
  const glowIntensity = 0.3 + Math.sin(frame * 0.1) * 0.15;

  // Urgency text
  const urgOp = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // Rotating ring
  const ringRotation = frame * 0.5;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 60 }}>
      {/* Rotating accent ring */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          border: "1px solid rgba(123,47,242,0.15)",
          transform: `rotate(${ringRotation}deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          border: "1px solid rgba(247,148,29,0.1)",
          transform: `rotate(${-ringRotation * 0.7}deg)`,
        }}
      />

      <div
        style={{
          opacity: mainOp,
          transform: `scale(${mainScale})`,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 24 }}>🚀</div>
        <div
          style={{
            fontSize: 60,
            fontWeight: 800,
            color: "white",
            lineHeight: 1.15,
            letterSpacing: -2,
            marginBottom: 20,
          }}
        >
          Pare de correr{"\n"}atrás de clientes
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 600,
            background: "linear-gradient(90deg, #7B2FF2, #F7941D)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 60,
          }}
        >
          Deixe a IA trabalhar por você
        </div>
      </div>

      {/* CTA Button */}
      <div
        style={{
          opacity: btnOp,
          transform: `translateY(${btnY}px)`,
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #7B2FF2, #5B1FD2)",
            borderRadius: 24,
            padding: "32px 64px",
            fontSize: 34,
            fontWeight: 700,
            color: "white",
            textAlign: "center",
            boxShadow: `0 0 ${60 * glowIntensity}px ${30 * glowIntensity}px rgba(123,47,242,${glowIntensity})`,
            letterSpacing: -0.5,
          }}
        >
          Comece agora — R$149/mês
        </div>
      </div>

      {/* Urgency */}
      <div
        style={{
          opacity: urgOp,
          marginTop: 40,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 26, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
          Primeira reunião em até 48h ou seu dinheiro de volta
        </div>
        <div style={{ fontSize: 22, color: "rgba(255,255,255,0.35)", marginTop: 16, fontWeight: 500 }}>
          prospecte.app
        </div>
      </div>
    </AbsoluteFill>
  );
};
