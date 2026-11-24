import React from "react";
import { AbsoluteFill, Audio, Composition, Sequence, staticFile, registerRoot } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMont } from "@remotion/google-fonts/Montserrat";
import { SceneView } from "./scenes";

loadInter("normal", { weights: ["400", "700", "800"], subsets: ["latin", "latin-ext"], ignoreTooManyRequestsWarning: true });
loadMont("normal", { weights: ["800", "900"], subsets: ["latin", "latin-ext"], ignoreTooManyRequestsWarning: true });

const shared = (f: string) => staticFile("shared/" + f);

const Lesson: React.FC<any> = ({ scenes, fps, lessonId }) => {
  const nar = (f: string) => staticFile(`${lessonId}/${f}`);
  return (
    <AbsoluteFill style={{ backgroundColor: "#eef3fa" }}>
      <Audio src={shared("music.wav")} loop volume={0.5} />
      {scenes.map((s: any) => (
        <Sequence key={s.id} from={s.start} durationInFrames={s.durationInFrames} name={s.id}>
          <SceneView scene={s} />
          <Audio src={shared("whoosh.wav")} volume={0.6} />
          {s.type === "flashcard" ? (
            <>
              <Sequence from={0} durationInFrames={s.narrationFrames + 4}>
                <Audio src={nar(s.narration)} />
              </Sequence>
              {[0, 1, 2].map((k) => (
                <Sequence key={k} from={s.qPhase + k * fps} durationInFrames={Math.round(fps * 0.5)}>
                  <Audio src={shared("tick.wav")} volume={0.9} />
                </Sequence>
              ))}
              <Sequence from={s.answerStart} durationInFrames={s.answerFrames + 40}>
                <Audio src={shared("bell.wav")} volume={0.8} />
                <Sequence from={6}>
                  <Audio src={nar(s.answer)} />
                </Sequence>
              </Sequence>
            </>
          ) : (
            <Sequence from={0} durationInFrames={s.narrationFrames + 4}>
              <Audio src={nar(s.narration)} />
              {["keypair", "compare", "statement"].includes(s.type) ? (
                <Sequence from={Math.round(fps * 0.4)}>
                  <Audio src={shared("pop.wav")} volume={0.7} />
                </Sequence>
              ) : null}
            </Sequence>
          )}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const LESSONS: Record<string, any> = {
  Carboxihemoglobina: require("../../public/carboxi-hemoglobina/props.json"),
  Parasitologia: require("../../public/parasitologia-ambiental/props.json"),
  BacteriasFungos: require("../../public/bacterias-e-fungos/props.json"),
};

const Root: React.FC = () => (
  <>
    {Object.entries(LESSONS).map(([id, p]) => (
      <Composition
        key={id}
        id={id}
        component={Lesson as any}
        durationInFrames={p.totalFrames}
        fps={p.fps}
        width={p.width}
        height={p.height}
        defaultProps={p as any}
      />
    ))}
  </>
);

registerRoot(Root);
