import { useEffect, useRef, useState } from "react";

interface BreathPhase {
  label: string;
  color: string;
  scale: number;
  dur: number;
}

export default function BreathingWidget() {
  const BREATH_PHASES: BreathPhase[] = [
    { label: "Breathe in…", color: "#7aad96", scale: 1.5, dur: 4 },
    { label: "Hold…", color: "#d4956a", scale: 1.5, dur: 4 },
    { label: "Breathe out…", color: "#7eb8d4", scale: 1, dur: 4 },
    { label: "Hold…", color: "#c9849a", scale: 1, dur: 2 },
  ];
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [scale, setScale] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const phase = BREATH_PHASES[phaseIdx];
    setScale(phase.scale);

    timerRef.current = setTimeout(() => {
      setPhaseIdx(i => (i + 1) % BREATH_PHASES.length);
    }, phase.dur * 1000);

    return () => clearTimeout(timerRef.current);
  }, [phaseIdx]);

  const phase = BREATH_PHASES[phaseIdx];

  return (
    <div style={{
      background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: 18, padding: "1.4rem 1.6rem",
      display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem",
    }}>
      <div style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 600,
        fontSize: "0.8rem", letterSpacing: "0.1em",
        textTransform: "uppercase", color: "var(--mist)",
      }}>
        Quick Breathing Exercise
      </div>

      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        border: "1px solid rgba(126,184,212,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: 50, height: 50, borderRadius: "50%",
          background: `radial-gradient(circle, ${phase.color}30, transparent 70%)`,
          border: `1px solid ${phase.color}88`,
          boxShadow: `0 0 20px ${phase.color}44`,
          transform: `scale(${scale})`,
          transition: `transform ${phase.dur * 0.9}s ease-in-out, border-color 0.5s, box-shadow 0.5s`,
        }} />
      </div>

      <div style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem",
        letterSpacing: "0.18em", textTransform: "uppercase",
        color: phase.color, transition: "color 0.4s",
      }}>
        {phase.label}
      </div>
    </div>
  );
}
