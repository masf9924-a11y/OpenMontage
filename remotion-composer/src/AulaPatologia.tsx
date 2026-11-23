import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  CalculateMetadataFunction,
} from "remotion";
import { resolveAsset } from "./lib/resolveAsset";
import { loadSpaceGrotesk } from "./lib/localFonts";

const { fontFamily } = loadSpaceGrotesk(["400", "500", "700"]);

// Palette — inspired by the pink cover of the source handout, on a deep plum base.
const C = {
  bg: "#1d1426",
  bg2: "#2a1b38",
  card: "#ffffff",
  text: "#f7eef6",
  muted: "#cdb8d0",
  accent: "#f07fb0",
  accent2: "#ffd166",
  ok: "#5fd39a",
  bad: "#ff6b6b",
};

export interface AulaSlide {
  type: "title" | "image" | "bullets" | "table" | "prova" | "question" | "answer" | "section";
  title?: string;
  subtitle?: string;
  image?: string;
  images?: string[];
  caption?: string;
  bullets?: string[];
  rows?: string[][];
  options?: string[];
  correct?: number;
  duration: number; // seconds
  audio?: string;
}

export interface AulaProps {
  episode: number;
  episodeTitle: string;
  slides: AulaSlide[];
  fps?: number;
}

const Bg: React.FC = () => {
  const f = useCurrentFrame();
  const a = (f / 30) * 4;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${30 + 10 * Math.sin(a / 20)}% ${20 + 8 * Math.cos(a / 25)}%, ${C.bg2} 0%, ${C.bg} 60%)`,
      }}
    />
  );
};

const useIn = (delay = 0) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: { damping: 18, stiffness: 120, mass: 0.8 } });
};

const Header: React.FC<{ title?: string; episode: number; episodeTitle: string }> = ({ title, episode, episodeTitle }) => {
  const p = useIn(0);
  return (
    <div style={{ position: "absolute", top: 40, left: 70, right: 70 }}>
      <div style={{ color: C.accent, fontSize: 24, letterSpacing: 3, textTransform: "uppercase", fontWeight: 500 }}>
        Patologia M3 · Episódio {episode} · {episodeTitle}
      </div>
      {title && (
        <div
          style={{
            color: C.text,
            fontSize: 60,
            fontWeight: 700,
            marginTop: 8,
            lineHeight: 1.1,
            opacity: p,
            transform: `translateY(${(1 - p) * 20}px)`,
          }}
        >
          {title}
        </div>
      )}
      <div style={{ height: 4, width: 160 * p, background: C.accent, marginTop: 14, borderRadius: 2 }} />
    </div>
  );
};

const Bullets: React.FC<{ items: string[]; duration: number; fontSize?: number; color?: string; marker?: string }> = ({
  items,
  duration,
  fontSize = 36,
  color = C.text,
  marker = C.accent,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const total = duration * fps;
  // Reveal bullets progressively across the first ~75% of the slide (narration pacing).
  const step = (total * 0.75) / Math.max(items.length, 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: fontSize * 0.55 }}>
      {items.map((b, i) => {
        const start = i === 0 ? 6 : i * step;
        const p = spring({ frame: f - start, fps, config: { damping: 20, stiffness: 110 } });
        const html = b.replace(/\*\*(.+?)\*\*/g, `<b style="color:${C.accent2}">$1</b>`);
        return (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 18,
              opacity: p,
              transform: `translateX(${(1 - p) * 30}px)`,
              fontSize,
              color,
              lineHeight: 1.3,
            }}
          >
            <div style={{ width: 14, height: 14, borderRadius: 7, background: marker, marginTop: fontSize * 0.42, flexShrink: 0 }} />
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        );
      })}
    </div>
  );
};

const Figure: React.FC<{ src: string; caption?: string; style?: React.CSSProperties }> = ({ src, caption, style }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = useIn(2);
  const zoom = interpolate(f, [0, durationInFrames], [1.0, 1.06], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        background: C.card,
        borderRadius: 18,
        padding: 14,
        boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
        display: "flex",
        flexDirection: "column",
        opacity: p,
        transform: `scale(${0.96 + 0.04 * p})`,
        overflow: "hidden",
        ...style,
      }}
    >
      <div style={{ flex: 1, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 }}>
        <Img
          src={resolveAsset(src)}
          style={{ width: "100%", height: "100%", objectFit: "contain", transform: `scale(${zoom})` }}
        />
      </div>
      {caption && (
        <div style={{ color: "#3b2a45", fontSize: 22, textAlign: "center", marginTop: 8, fontWeight: 500 }}>{caption}</div>
      )}
    </div>
  );
};

const BODY_TOP = 200;

const SlideView: React.FC<{ s: AulaSlide; episode: number; episodeTitle: string }> = ({ s, episode, episodeTitle }) => {
  const p = useIn(0);
  if (s.type === "title" || s.type === "section") {
    const big = s.type === "title";
    return (
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 120 }}>
        {s.image && (
          <AbsoluteFill style={{ opacity: 0.18 }}>
            <Img src={resolveAsset(s.image)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(2px)" }} />
          </AbsoluteFill>
        )}
        <div style={{ color: C.accent, fontSize: big ? 34 : 28, letterSpacing: 6, textTransform: "uppercase", opacity: p }}>
          {big ? `Patologia M3 · Episódio ${episode}` : `Episódio ${episode} · ${episodeTitle}`}
        </div>
        <div
          style={{
            color: C.text,
            fontSize: big ? 96 : 80,
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.05,
            marginTop: 20,
            transform: `scale(${0.9 + 0.1 * p})`,
            opacity: p,
          }}
        >
          {s.title}
        </div>
        {s.subtitle && (
          <div style={{ color: C.muted, fontSize: 38, marginTop: 28, textAlign: "center", opacity: useIn(10) }}>{s.subtitle}</div>
        )}
        <div style={{ height: 6, width: 300 * p, background: C.accent, marginTop: 36, borderRadius: 3 }} />
      </AbsoluteFill>
    );
  }

  if (s.type === "image") {
    const imgs = s.images ?? (s.image ? [s.image] : []);
    const hasText = (s.bullets?.length ?? 0) > 0;
    return (
      <AbsoluteFill>
        <Header title={s.title} episode={episode} episodeTitle={episodeTitle} />
        <div
          style={{
            position: "absolute",
            top: BODY_TOP,
            left: 70,
            right: 70,
            bottom: 50,
            display: "flex",
            gap: 40,
          }}
        >
          <div style={{ flex: hasText ? 1.25 : 1, display: "flex", gap: 24 }}>
            {imgs.map((im, i) => (
              <Figure key={i} src={im} caption={i === imgs.length - 1 ? s.caption : undefined} style={{ flex: 1 }} />
            ))}
          </div>
          {hasText && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Bullets items={s.bullets!} duration={s.duration} fontSize={38} />
            </div>
          )}
        </div>
      </AbsoluteFill>
    );
  }

  if (s.type === "bullets" || s.type === "prova") {
    const prova = s.type === "prova";
    return (
      <AbsoluteFill>
        <Header title={prova ? undefined : s.title} episode={episode} episodeTitle={episodeTitle} />
        {prova && (
          <div style={{ position: "absolute", top: 100, left: 70, display: "flex", alignItems: "center", gap: 20, opacity: p }}>
            <div style={{ fontSize: 70 }}>🎯</div>
            <div style={{ color: C.accent2, fontSize: 64, fontWeight: 700 }}>{s.title ?? "Olho na Prova"}</div>
          </div>
        )}
        <div
          style={{
            position: "absolute",
            top: prova ? 230 : BODY_TOP + 10,
            left: 90,
            right: 90,
            bottom: 60,
            padding: prova ? "36px 48px" : 0,
            border: prova ? `3px solid ${C.accent2}` : undefined,
            borderRadius: 24,
            background: prova ? "rgba(255,209,102,0.07)" : undefined,
          }}
        >
          <Bullets
            items={s.bullets ?? []}
            duration={s.duration}
            fontSize={(s.bullets?.length ?? 0) > 5 ? 40 : 46}
            marker={prova ? C.accent2 : C.accent}
          />
        </div>
      </AbsoluteFill>
    );
  }

  if (s.type === "table") {
    const rows = s.rows ?? [];
    return (
      <AbsoluteFill>
        <Header title={s.title} episode={episode} episodeTitle={episodeTitle} />
        <div style={{ position: "absolute", top: BODY_TOP + 10, left: 90, right: 90 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: rows.length > 5 ? 34 : 38, color: C.text }}>
            <tbody>
              {rows.map((r, i) => {
                const rp = useIn(4 + i * 12);
                return (
                  <tr key={i} style={{ opacity: rp, background: i === 0 ? "rgba(240,127,176,0.25)" : i % 2 ? "rgba(255,255,255,0.04)" : "transparent" }}>
                    {r.map((c, j) => (
                      <td
                        key={j}
                        style={{
                          padding: "14px 18px",
                          borderBottom: "1px solid rgba(255,255,255,0.15)",
                          fontWeight: i === 0 || j === 0 ? 700 : 400,
                          color: i === 0 ? C.accent2 : j === 0 ? C.accent : C.text,
                        }}
                        dangerouslySetInnerHTML={{ __html: c.replace(/\*\*(.+?)\*\*/g, `<b style="color:${C.accent2}">$1</b>`) }}
                      />
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </AbsoluteFill>
    );
  }

  // question / answer
  const isAnswer = s.type === "answer";
  const opts = s.options ?? [];
  const hasImg = !!s.image;
  return (
    <AbsoluteFill>
      <Header title={s.title} episode={episode} episodeTitle={episodeTitle} />
      <div style={{ position: "absolute", top: BODY_TOP, left: 70, right: 70, bottom: 50, display: "flex", gap: 36 }}>
        {hasImg && <Figure src={s.image!} style={{ flex: 0.8 }} />}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
          {s.subtitle && <div style={{ color: C.text, fontSize: 32, lineHeight: 1.3, marginBottom: 6 }}>{s.subtitle}</div>}
          {opts.map((o, i) => {
            const op = useIn(8 + i * 8);
            const right = isAnswer && i === s.correct;
            const wrong = isAnswer && i !== s.correct;
            return (
              <div
                key={i}
                style={{
                  opacity: op * (wrong ? 0.55 : 1),
                  display: "flex",
                  gap: 16,
                  padding: "14px 20px",
                  borderRadius: 14,
                  fontSize: 28,
                  lineHeight: 1.25,
                  color: C.text,
                  background: right ? "rgba(95,211,154,0.18)" : "rgba(255,255,255,0.05)",
                  border: `2px solid ${right ? C.ok : "rgba(255,255,255,0.12)"}`,
                }}
              >
                <b style={{ color: right ? C.ok : C.accent }}>{String.fromCharCode(65 + i)})</b>
                <span>{o}</span>
                {right && <span style={{ marginLeft: "auto", color: C.ok, fontSize: 34 }}>✔</span>}
              </div>
            );
          })}
          {isAnswer && s.bullets && (
            <div style={{ marginTop: 8 }}>
              <Bullets items={s.bullets} duration={s.duration} fontSize={26} color={C.muted} marker={C.ok} />
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ProgressBar: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: 0, bottom: 0, height: 6, width: `${(f / durationInFrames) * 100}%`, background: C.accent }} />
  );
};

export const AulaPatologia: React.FC<AulaProps> = ({ episode, episodeTitle, slides }) => {
  const { fps } = useVideoConfig();
  let t = 0;
  return (
    <AbsoluteFill style={{ fontFamily, background: C.bg }}>
      <Bg />
      {slides.map((s, i) => {
        const from = Math.round(t * fps);
        const dur = Math.max(1, Math.round(s.duration * fps));
        t += s.duration;
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <SlideView s={s} episode={episode} episodeTitle={episodeTitle} />
            {s.audio && <Audio src={resolveAsset(s.audio)} />}
          </Sequence>
        );
      })}
      <ProgressBar />
    </AbsoluteFill>
  );
};

export const calculateAulaMetadata: CalculateMetadataFunction<AulaProps> = ({ props }) => {
  const fps = props.fps ?? 30;
  const total = props.slides.reduce((a, s) => a + s.duration, 0);
  return { durationInFrames: Math.max(1, Math.ceil(total * fps)), fps };
};
