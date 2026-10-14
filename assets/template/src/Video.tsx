import React from 'react';
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame } from 'remotion';
import { EndingScene, HookScene, MechanismScene } from './components/Scenes';
import { SCENE_DURATIONS } from './timing';
import { AMBER, BG_DEEP } from './theme';
import { Background, Grain, Label } from './components/kit';

/** 相邻场景重叠的帧数:让淡入淡出与缩放连成一条呼吸,而不是硬切。 */
const OVERLAP = 18;

const Shot: React.FC<{
  bleed: number;
  first?: boolean;
  last?: boolean;
  children: React.ReactNode;
}> = ({ bleed, first, last, children }) => {
  const frame = useCurrentFrame();
  const fadeIn = first ? -40 : 0;
  const opacity = interpolate(frame, [fadeIn, fadeIn + 14, bleed - OVERLAP, bleed], [0, 1, 1, last ? 0.9 : 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = interpolate(frame, [0, 34, bleed], [1.05, 1.0, 1.04], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const sweepP = Math.max(0, Math.min(1, (frame - (bleed - 34)) / 34));
  const sweepOn = last ? 0 : Math.sin(Math.PI * sweepP);

  return (
    <AbsoluteFill style={{ opacity, transform: `scale(${scale})`, transformOrigin: '50% 45%' }}>
      {children}
      {sweepOn > 0.015 && (
        <div
          style={{
            position: 'absolute',
            left: -300 + sweepP * 2520,
            top: -160,
            width: 300,
            height: 1400,
            background:
              'linear-gradient(96deg, rgba(127,224,200,0) 0%, rgba(127,224,200,0.10) 38%, rgba(255,201,120,0.20) 50%, rgba(127,224,200,0.10) 62%, rgba(127,224,200,0) 100%)',
            opacity: sweepOn * 0.7,
            filter: 'blur(14px)',
            transform: 'skewX(-8deg)',
          }}
        />
      )}
    </AbsoluteFill>
  );
};

export const Video: React.FC = () => {
  const scenes: { key: keyof typeof SCENE_DURATIONS; node: React.ReactNode }[] = [
    { key: 'hook', node: <HookScene durationInFrames={SCENE_DURATIONS.hook} /> },
    { key: 'mechanism', node: <MechanismScene durationInFrames={SCENE_DURATIONS.mechanism} /> },
    { key: 'ending', node: <EndingScene durationInFrames={SCENE_DURATIONS.ending} /> },
  ];

  let offset = 0;
  return (
    <AbsoluteFill style={{ background: BG_DEEP }}>
      <Background />
      {scenes.map((s, i) => {
        const dur = SCENE_DURATIONS[s.key];
        const last = i === scenes.length - 1;
        const bleed = last ? dur : dur + OVERLAP;
        const from = offset;
        offset += dur;
        return (
          <Sequence key={s.key} from={from} durationInFrames={bleed}>
            <Shot bleed={bleed} first={i === 0} last={last}>
              {s.node}
            </Shot>
          </Sequence>
        );
      })}
      <Label text="__WATERMARK__" style={{ top: 64, right: 56 }} opacity={0.7} color={AMBER} />
      <Grain />
    </AbsoluteFill>
  );
};
