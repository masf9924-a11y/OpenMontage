import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { T } from "./theme";

const ease = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Molecules: React.FC<{ hue?: string }> = ({ hue = T.teal }) => {
  const frame = useCurrentFrame();
  const dots = new Array(26).fill(0);
  return (
    <AbsoluteFill style={{ opacity: 0.07 }}>
      <svg width="1920" height="1080">
        {dots.map((_, i) => {
          const a = (i / dots.length) * Math.PI * 2 + frame * 0.003;
          const r = 360 + (i % 5) * 70;
          const cx = 960 + Math.cos(a) * r;
          const cy = 540 + Math.sin(a) * r * 0.62;
          return <circle key={i} cx={cx} cy={cy} r={6 + (i % 3) * 3} fill={hue} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

const Shell: React.FC<{ children: React.ReactNode; accent?: boolean }> = ({ children, accent }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(1200px 700px at 50% 30%, ${T.bg0}, ${T.bg1})`,
      fontFamily: "Inter, sans-serif",
      color: T.ink,
    }}
  >
    <Molecules hue={accent ? T.accent : T.teal} />
    {children}
  </AbsoluteFill>
);

const Title: React.FC<{ v: any }> = ({ v }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 160 } });
  return (
    <Shell>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <div
          style={{
            letterSpacing: 10,
            color: T.teal,
            fontWeight: 800,
            fontSize: 30,
            opacity: ease(frame, 0, 15),
            transform: `translateY(${interpolate(s, [0, 1], [20, 0])}px)`,
          }}
        >
          {v.kicker}
        </div>
        <div
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 800,
            fontSize: 108,
            margin: "18px 0",
            color: T.navy,
            transform: `scale(${interpolate(s, [0, 1], [0.86, 1])})`,
            opacity: ease(frame, 4, 22),
          }}
        >
          {v.title}
        </div>
        <div style={{ height: 6, width: interpolate(s, [0, 1], [0, 420]), background: T.teal, borderRadius: 4 }} />
        <div style={{ fontSize: 38, color: T.sub, marginTop: 26, opacity: ease(frame, 18, 36), maxWidth: 1200 }}>
          {v.subtitle}
        </div>
      </AbsoluteFill>
    </Shell>
  );
};

const Header: React.FC<{ text: string; accent?: boolean }> = ({ text, accent }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ marginBottom: 46 }}>
      <div
        style={{
          fontFamily: "Montserrat, sans-serif",
          fontWeight: 800,
          fontSize: 70,
          color: accent ? T.accent : T.navy,
          opacity: ease(frame, 0, 12),
          transform: `translateX(${interpolate(ease(frame, 0, 14), [0, 1], [-30, 0])}px)`,
        }}
      >
        {text}
      </div>
      <div style={{ height: 8, width: interpolate(ease(frame, 6, 24), [0, 1], [0, 320]), background: accent ? T.accent : T.teal, borderRadius: 5, marginTop: 10 }} />
    </div>
  );
};

const Points: React.FC<{ v: any }> = ({ v }) => {
  const frame = useCurrentFrame();
  return (
    <Shell accent={v.accent}>
      <AbsoluteFill style={{ padding: "120px 150px", justifyContent: "center" }}>
        <Header text={v.title} accent={v.accent} />
        <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
          {v.points.map((p: string, i: number) => {
            const start = 16 + i * 16;
            const o = ease(frame, start, start + 14);
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 26,
                  opacity: o,
                  transform: `translateX(${interpolate(o, [0, 1], [-40, 0])}px)`,
                }}
              >
                <div
                  style={{
                    minWidth: 26,
                    height: 26,
                    borderRadius: 13,
                    background: v.accent ? T.accent : T.teal,
                    transform: `scale(${interpolate(ease(frame, start, start + 10), [0, 1], [0, 1])})`,
                  }}
                />
                <div style={{ fontSize: 44, color: T.ink, lineHeight: 1.25 }}>{p}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Shell>
  );
};

const Statement: React.FC<{ v: any }> = ({ v }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 140 } });
  return (
    <Shell>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center", padding: "0 180px" }}>
        <div
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 800,
            fontSize: 92,
            color: T.navy,
            transform: `scale(${interpolate(s, [0, 1], [0.8, 1])})`,
            opacity: ease(frame, 0, 16),
          }}
        >
          {v.big}
        </div>
        <div style={{ fontSize: 40, color: T.sub, marginTop: 34, opacity: ease(frame, 16, 34), maxWidth: 1300 }}>{v.small}</div>
      </AbsoluteFill>
    </Shell>
  );
};

const Card: React.FC<{ side: "l" | "r"; name: string; tag: string; items: string[]; frame: number; tone?: string }> = ({ side, name, tag, items, frame, tone }) => {
  const o = ease(frame, side === "l" ? 10 : 18, (side === "l" ? 10 : 18) + 16);
  const dx = interpolate(o, [0, 1], [side === "l" ? -60 : 60, 0]);
  return (
    <div
      style={{
        flex: 1,
        background: T.card,
        borderRadius: 26,
        padding: 48,
        boxShadow: "0 18px 50px rgba(18,67,107,0.14)",
        borderTop: `10px solid ${tone || T.teal}`,
        opacity: o,
        transform: `translateX(${dx}px)`,
      }}
    >
      <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 52, color: tone || T.navy }}>{name}</div>
      <div style={{ fontSize: 30, color: T.sub, fontStyle: "italic", marginBottom: 26 }}>{tag}</div>
      {items.map((it, i) => {
        const st = (side === "l" ? 26 : 34) + i * 10;
        return (
          <div key={i} style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 18, opacity: ease(frame, st, st + 12) }}>
            <div style={{ width: 16, height: 16, borderRadius: 8, background: tone || T.teal }} />
            <div style={{ fontSize: 36, color: T.ink }}>{it}</div>
          </div>
        );
      })}
    </div>
  );
};

const TwoTypes: React.FC<{ v: any }> = ({ v }) => {
  const frame = useCurrentFrame();
  return (
    <Shell>
      <AbsoluteFill style={{ padding: "90px 120px", justifyContent: "center" }}>
        <Header text={v.title} />
        <div style={{ display: "flex", gap: 50 }}>
          <Card side="l" name={v.left.name} tag={v.left.tag} items={v.left.where} frame={frame} tone={T.teal} />
          <Card side="r" name={v.right.name} tag={v.right.tag} items={v.right.where} frame={frame} tone={T.gold} />
        </div>
      </AbsoluteFill>
    </Shell>
  );
};

const KeyPair: React.FC<{ v: any }> = ({ v }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const Pill = ({ text, delay, tone }: any) => {
    const s = spring({ frame: frame - delay, fps, config: { damping: 120 } });
    const glow = Math.max(0, Math.sin((frame - delay) * 0.12)) * 26;
    return (
      <div
        style={{
          background: T.card,
          border: `4px solid ${tone}`,
          color: tone,
          fontFamily: "Montserrat, sans-serif",
          fontWeight: 800,
          fontSize: 56,
          padding: "34px 60px",
          borderRadius: 24,
          transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`,
          opacity: interpolate(s, [0, 1], [0, 1]),
          boxShadow: `0 0 ${glow}px ${tone}66`,
        }}
      >
        {text}
      </div>
    );
  };
  return (
    <Shell>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 40 }}>
        <div style={{ letterSpacing: 8, color: T.accent, fontWeight: 800, fontSize: 34, opacity: ease(frame, 0, 12) }}>{v.label}</div>
        <Pill text={v.a} delay={8} tone={T.teal} />
        <div style={{ fontSize: 46, color: T.sub, opacity: ease(frame, 20, 30) }}>+</div>
        <Pill text={v.b} delay={22} tone={T.gold} />
      </AbsoluteFill>
    </Shell>
  );
};

const Reaction: React.FC<{ v: any }> = ({ v }) => {
  const frame = useCurrentFrame();
  const box = (label: string, o: number, tone: string) => (
    <div style={{ background: T.card, border: `3px solid ${tone}`, borderRadius: 20, padding: "30px 40px", fontSize: 40, fontWeight: 700, color: tone, opacity: o, transform: `translateY(${interpolate(o, [0, 1], [20, 0])}px)` }}>
      {label}
    </div>
  );
  return (
    <Shell>
      <AbsoluteFill style={{ padding: "90px 120px", justifyContent: "center" }}>
        <Header text={v.title} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 40, marginTop: 30 }}>
          {box(v.left, ease(frame, 8, 22), T.navy)}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: ease(frame, 20, 32) }}>
            <div style={{ fontSize: 24, color: T.sub }}>{v.sites.join(" · ")}</div>
            <div style={{ fontSize: 70, color: T.teal }}>→</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {v.right.map((r: string, i: number) => box(r, ease(frame, 30 + i * 12, 44 + i * 12), i === 0 ? T.teal : T.gold))}
          </div>
        </div>
      </AbsoluteFill>
    </Shell>
  );
};

const Compare: React.FC<{ v: any }> = ({ v }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const Panel = ({ data, delay }: any) => {
    const tone = data.tone === "danger" ? T.accent : T.ok;
    const o = ease(frame, delay, delay + 14);
    const st = spring({ frame: frame - delay - 18, fps, config: { damping: 90 } });
    return (
      <div style={{ flex: 1, background: T.card, borderRadius: 26, padding: 56, borderTop: `12px solid ${tone}`, boxShadow: "0 18px 50px rgba(18,67,107,0.14)", opacity: o, transform: `translateY(${interpolate(o, [0, 1], [40, 0])}px)` }}>
        <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 54, color: T.navy }}>{data.name}</div>
        <div style={{ marginTop: 40, fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: 86, color: tone, letterSpacing: 2, transform: `scale(${interpolate(st, [0, 1], [0.4, 1])})`, opacity: interpolate(st, [0, 1], [0, 1]), textShadow: `0 0 ${Math.max(0, Math.sin((frame - delay) * 0.1)) * 24}px ${tone}66` }}>
          {data.verdict}
        </div>
      </div>
    );
  };
  return (
    <Shell accent>
      <AbsoluteFill style={{ padding: "90px 120px", justifyContent: "center" }}>
        <Header text={v.title} accent />
        <div style={{ display: "flex", gap: 50 }}>
          <Panel data={v.left} delay={12} />
          <Panel data={v.right} delay={24} />
        </div>
      </AbsoluteFill>
    </Shell>
  );
};

const Flashcard: React.FC<{ v: any; qPhase: number; countPhase: number }> = ({ v, qPhase, countPhase }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inReveal = frame >= qPhase + countPhase;
  const countNow = Math.max(0, Math.min(3, 3 - Math.floor((frame - qPhase) / fps)));
  const ring = interpolate(frame, [qPhase, qPhase + countPhase], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const revS = spring({ frame: frame - (qPhase + countPhase), fps, config: { damping: 120 } });
  return (
    <Shell>
      <AbsoluteFill style={{ padding: "80px 140px", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <div style={{ letterSpacing: 8, color: T.teal, fontWeight: 800, fontSize: 30, opacity: ease(frame, 0, 10) }}>FLASHCARD</div>
        <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 60, color: T.navy, margin: "30px 0 10px", maxWidth: 1500, opacity: ease(frame, 4, 18) }}>
          {v.q}
        </div>

        {!inReveal && (
          <div style={{ position: "relative", width: 220, height: 220, marginTop: 40 }}>
            <svg width="220" height="220" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="110" cy="110" r="96" stroke={T.line} strokeWidth="14" fill="none" />
              <circle cx="110" cy="110" r="96" stroke={T.teal} strokeWidth="14" fill="none" strokeLinecap="round" strokeDasharray={2 * Math.PI * 96} strokeDashoffset={(1 - ring) * 2 * Math.PI * 96} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "Montserrat, sans-serif", fontWeight: 900, fontSize: 110, color: T.teal }}>
              {countNow}
            </div>
          </div>
        )}

        {inReveal && (
          <div style={{ marginTop: 40, transform: `translateY(${interpolate(revS, [0, 1], [50, 0])}px) scale(${interpolate(revS, [0, 1], [0.9, 1])})`, opacity: interpolate(revS, [0, 1], [0, 1]) }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 20, background: T.card, border: `4px solid ${T.ok}`, borderRadius: 24, padding: "36px 56px", boxShadow: "0 18px 50px rgba(21,128,61,0.18)" }}>
              <div style={{ color: T.ok, fontSize: 60 }}>✓</div>
              <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 52, color: T.ink, maxWidth: 1200, textAlign: "left" }}>{v.a}</div>
            </div>
          </div>
        )}
      </AbsoluteFill>
    </Shell>
  );
};

export const SceneView: React.FC<{ scene: any }> = ({ scene }) => {
  const v = scene.visual;
  switch (scene.type) {
    case "title":
      return <Title v={v} />;
    case "points":
      return <Points v={v} />;
    case "statement":
      return <Statement v={v} />;
    case "twotypes":
      return <TwoTypes v={v} />;
    case "keypair":
      return <KeyPair v={v} />;
    case "reaction":
      return <Reaction v={v} />;
    case "compare":
      return <Compare v={v} />;
    case "flashcard":
      return <Flashcard v={v} qPhase={scene.qPhase} countPhase={scene.countPhase} />;
    default:
      return <Shell><AbsoluteFill /></Shell>;
  }
};
