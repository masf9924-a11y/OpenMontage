import React from "react";
import {
  AbsoluteFill,
  Audio,
  Composition,
  Sequence,
  staticFile,
  registerRoot,
  continueRender,
  delayRender,
} from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";
import { SceneView } from "./scenes";

loadInter("normal", { weights: ["400", "700", "800"], subsets: ["latin", "latin-ext"], ignoreTooManyRequestsWarning: true });
loadMont("normal", { weights: ["800", "900"], subsets: ["latin", "latin-ext"], ignoreTooManyRequestsWarning: true });

const sf = (f: string) => staticFile("col/" + f);

const Lesson: React.FC<any> = (props) => {
  const { scenes, fps } = props;
  return (
    <AbsoluteFill style={{ backgroundColor: "#eef3fa" }}>
      {/* Background music bed, looped, kept well below narration */}
      <Audio src={sf("music.wav")} loop volume={0.5} />

      {scenes.map((s: any) => (
        <Sequence key={s.id} from={s.start} durationInFrames={s.durationInFrames} name={s.id}>
          <SceneView scene={s} />
          {/* soft whoosh on entrance */}
          <Audio src={sf("whoosh.wav")} volume={0.6} />

          {s.type === "flashcard" ? (
            <>
              {/* question narration */}
              <Sequence from={0} durationInFrames={s.narrationFrames + 4}>
                <Audio src={sf(s.narration)} />
              </Sequence>
              {/* 3s tick countdown */}
              {[0, 1, 2].map((k) => (
                <Sequence key={k} from={s.qPhase + k * fps} durationInFrames={Math.round(fps * 0.5)}>
                  <Audio src={sf("tick.wav")} volume={0.9} />
                </Sequence>
              ))}
              {/* bell + answer narration on reveal */}
              <Sequence from={s.answerStart} durationInFrames={s.answerFrames + 40}>
                <Audio src={sf("bell.wav")} volume={0.8} />
                <Sequence from={6}>
                  <Audio src={sf(s.answer)} />
                </Sequence>
              </Sequence>
            </>
          ) : (
            <Sequence from={0} durationInFrames={s.narrationFrames + 4}>
              <Audio src={sf(s.narration)} />
              {["keypair", "compare", "statement"].includes(s.type) ? (
                <Sequence from={Math.round(fps * 0.4)}>
                  <Audio src={sf("pop.wav")} volume={0.7} />
                </Sequence>
              ) : null}
            </Sequence>
          )}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const PROPS = require("../../public/col/props.json");

const Root: React.FC = () => {
  return (
    <Composition
      id="Colinesterase"
      component={Lesson as any}
      durationInFrames={PROPS.totalFrames}
      fps={PROPS.fps}
      width={PROPS.width}
      height={PROPS.height}
      defaultProps={PROPS as any}
    />
  );
};

registerRoot(Root);
