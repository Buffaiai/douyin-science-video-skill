import React from 'react';
import { useCurrentFrame } from 'remotion';
import { AMBER, ICE, ROSE, WARM_WHITE } from '../theme';
import { ease, span } from '../timing';
import {
  ChunkedSub,
  DataTag,
  GlowSvg,
  QuoteCard,
  QuoteText,
  Ring,
  SourceTag,
  StampText,
} from './kit';

/*
 * 三场占位,演示本期母题道具的接法。开工时:
 *   1. 把「本期母题」写成一个组件放进 kit.tsx 的「本期道具」区,让它在每一场都出现(母题必须贯穿全片);
 *   2. 每场只留一个视觉动作 + 2~4 句底部字幕;
 *   3. 场次增删要同步改 timing.ts 的 SCENE_DURATIONS 和 Video.tsx 的 scenes 数组。
 */

export const HookScene: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const pulse = span(frame, 10, 260);
  return (
    <>
      {/* 第 0 帧就要有完整内容:主体先以低透明度常驻,不许全黑淡入 */}
      <GlowSvg>
        <Ring cx={960} cy={500} r={210} gap={62} color={AMBER} width={1.4} opacity={0.25 + pulse * 0.5} pulse={pulse} />
      </GlowSvg>
      <DataTag x={1180} y={300} label="只标方向" value="不给倍数" from={140} color={ICE} size={34} />
      <ChunkedSub
        chunks={['开场用第二人称情感悬念句', '不要用概念名开场', '你只需要一句戳中日常失误的话']}
        durationInFrames={durationInFrames}
        accents={['日常失误']}
      />
    </>
  );
};

export const MechanismScene: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const grow = ease.out(span(frame, 20, 260));
  return (
    <>
      <GlowSvg>
        <Ring cx={700} cy={480} r={170} gap={62 * (1 - grow)} color={ROSE} width={1.2} opacity={0.9} />
        <line x1={700} y1={480} x2={1240} y2={480} stroke={ICE} strokeWidth={2 + grow * 4} strokeOpacity={0.5} />
      </GlowSvg>
      <QuoteCard
        x={1240}
        y={420}
        original="Original paper title (verbatim)"
        translated="中文译名"
        credit="作者 · 期刊 · 年份 · PMID"
        from={80}
      />
      <StampText x={1240} y={700} text="机制" from={200} color={AMBER} size={54} />
      <SourceTag text="出处：作者 · 年份 · 期刊 · PMID 12345678" opacity={grow} />
      <ChunkedSub
        chunks={['机制解释要落到一句可核实的话', '数字只在摘要查得到时才写', '角标放具体数值,字幕放结论']}
        durationInFrames={durationInFrames}
        accents={['可核实']}
      />
    </>
  );
};

export const EndingScene: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const close = ease.inOut(span(frame, 20, 180));
  return (
    <>
      <GlowSvg>
        <Ring cx={960} cy={430} r={230} gap={62} closeP={close} color={AMBER} width={1.1} opacity={0.55} pulse={1 - close} />
      </GlowSvg>
      <QuoteText
        lines={[
          { text: '金句收尾', accents: ['金句'] },
          { text: '一句值得截图转发的话', accents: ['截图转发'], accentColor: WARM_WHITE },
        ]}
        from={10}
        y={52}
      />
      <SourceTag text="结尾不放活动落版,只留内容本身的署名" opacity={close} />
    </>
  );
};
