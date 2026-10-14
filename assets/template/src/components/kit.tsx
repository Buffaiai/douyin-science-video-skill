import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import {
  AMBER,
  AMBER_DIM,
  AMBER_SOFT,
  BG_DEEP,
  BG_EDGE,
  BG_MID,
  DAWN,
  DIM,
  FAINT,
  ICE,
  ICE_DIM,
  ICE_SOFT,
  MONO,
  ROSE,
  ROSE_DIM,
  ROSE_SOFT,
  SANS,
  SERIF,
  SILVER,
  WARM_WHITE,
} from '../theme';
import { span } from '../timing';

export const makeRand = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

/* ---------------- 底色:靛蓝夜 + 散景 ---------------- */

type Bokeh = { x: number; y: number; r: number; a: number; warm: boolean; ph: number };

const BOKEH: Bokeh[] = (() => {
  const r = makeRand(20261010);
  return Array.from({ length: 27 }, (_, i) => ({
    x: r() * 1920,
    y: r() * 1080,
    r: 70 + r() * 230,
    a: 0.06 + r() * 0.13,
    warm: i % 3 === 0,
    ph: r() * Math.PI * 2,
  }));
})();

export const Background: React.FC<{ lift?: number }> = ({ lift = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 88% 80% at 50% 44%, ${BG_MID} 0%, ${BG_DEEP} 55%, ${BG_EDGE} 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 46% 38% at 22% 74%, rgba(143,214,255,0.09) 0%, rgba(143,214,255,0) 70%), radial-gradient(ellipse 46% 38% at 78% 26%, rgba(255,194,106,0.08) 0%, rgba(255,194,106,0) 70%)',
        }}
      />
      <AbsoluteFill style={{ opacity: 0.92 + lift }}>
        {BOKEH.map((b, i) => {
          const drift = 0.5 + 0.5 * Math.sin(frame * 0.012 + b.ph * 5);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: b.x,
                top: b.y + drift * 22,
                width: b.r * 2,
                height: b.r * 2,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${b.warm ? 'rgba(255,194,106,0.5)' : 'rgba(143,214,255,0.44)'} 0%, rgba(0,0,0,0) 68%)`,
                opacity: b.a,
                filter: 'blur(28px)',
              }}
            />
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 86% 82% at 50% 48%, rgba(0,0,0,0) 47%, rgba(0,0,0,0.22) 86%, rgba(0,0,0,0.38) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.14 }) => {
  const frame = useCurrentFrame();
  const dx = (frame * 13) % 60;
  const dy = (frame * 29) % 60;
  return (
    <svg
      width={2040}
      height={1200}
      style={{ position: 'absolute', left: -60 + dx, top: -60 + dy, opacity, mixBlendMode: 'overlay' }}
    >
      <filter id="zg-grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.78" numOctaves={2} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={2040} height={1200} filter="url(#zg-grain)" />
    </svg>
  );
};

/* ---------------- 通用发光 / 文字 ---------------- */

export const GlowSvg: React.FC<{ children: React.ReactNode; opacity?: number }> = ({
  children,
  opacity = 1,
}) => (
  <svg
    width={1920}
    height={1080}
    viewBox="0 0 1920 1080"
    style={{ position: 'absolute', left: 0, top: 0, opacity }}
  >
    {children}
  </svg>
);

const LAYERS: [number, number][] = [
  [15, 0.06],
  [7.5, 0.13],
  [3.8, 0.3],
  [1.9, 1],
];

export const GlowPath: React.FC<{
  d: string;
  color: string;
  opacity?: number;
  bloom?: number;
  core?: number;
  width?: number;
}> = ({ d, color, opacity = 1, bloom = 1, core = 1, width = 1 }) => {
  if (!d) return null;
  return (
    <g opacity={opacity}>
      {LAYERS.map(([w, o], i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={w * width * (i === LAYERS.length - 1 ? core : bloom)}
          strokeOpacity={i === LAYERS.length - 1 ? o * core : o * bloom}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </g>
  );
};

export const GlowBall: React.FC<{
  x: number;
  y: number;
  r: number;
  color: string;
  opacity?: number;
  coreWhite?: number;
}> = ({ x, y, r, color, opacity = 1, coreWhite = 1 }) => {
  const size = r * 7;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(255,255,255,${coreWhite}) 0%, ${color} 18%, ${color}88 34%, ${color}00 66%)`,
        opacity,
      }}
    />
  );
};

export const Label: React.FC<{
  text: string;
  opacity?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ text, opacity = 1, color = WARM_WHITE, style }) => (
  <div
    style={{
      position: 'absolute',
      fontFamily: SANS,
      fontSize: 22,
      letterSpacing: 8,
      color,
      opacity: opacity * 0.5,
      ...style,
    }}
  >
    {text}
  </div>
);

export const SourceTag: React.FC<{
  text: string;
  opacity?: number;
  position?: { left?: number; right?: number; top?: number; bottom?: number };
}> = ({ text, opacity = 1, position = { right: 56, bottom: 44 } }) => (
  <div
    style={{
      position: 'absolute',
      ...position,
      fontFamily: SANS,
      fontSize: 19,
      letterSpacing: 3,
      color: WARM_WHITE,
      opacity: opacity * 0.46,
      border: '1px solid rgba(246,241,230,0.20)',
      borderRadius: 4,
      padding: '5px 12px',
      background: 'rgba(11,19,34,0.55)',
      whiteSpace: 'nowrap',
    }}
  >
    {text}
  </div>
);

export const DataTag: React.FC<{
  x: number;
  y: number;
  label: string;
  value: string;
  from: number;
  color?: string;
  size?: number;
  align?: 'left' | 'right' | 'center';
}> = ({ x, y, label, value, from, color = AMBER, size = 44, align = 'left' }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [from, from + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const dy = interpolate(frame, [from, from + 16], [14, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const center = align === 'center';
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: center ? 560 : undefined,
        transform: `translateX(${center ? -280 : 0}px) translateY(${dy}px)`,
        opacity: o,
        display: 'flex',
        flexDirection: center ? 'column' : 'row',
        alignItems: center ? 'center' : 'baseline',
        gap: 10,
        textAlign: center ? 'center' : undefined,
        ...(align === 'right' ? { flexDirection: 'row-reverse' as const } : {}),
      }}
    >
      <span style={{ fontFamily: SANS, fontSize: 20, letterSpacing: 4, color: WARM_WHITE, opacity: 0.55, whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <span
        style={{
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: size,
          color,
          textShadow: `0 0 26px ${color}66, 0 2px 12px rgba(0,0,0,0.8)`,
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </span>
    </div>
  );
};

export const StampText: React.FC<{
  x: number;
  y: number;
  text: string;
  from: number;
  color: string;
  rot?: number;
  size?: number;
}> = ({ x, y, text, from, color, rot = -4, size = 62 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [from, from + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const s = interpolate(frame, [from, from + 14], [1.6, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        padding: '14px 34px',
        border: `3px solid ${color}`,
        borderRadius: 12,
        transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`,
        opacity: o,
        fontFamily: SERIF,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: 10,
        color,
        textShadow: `0 0 26px ${color}99`,
        background: 'rgba(11,16,32,0.55)',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

/** 出处卡:原书名(原文)+ 中文译名 + 作者 · 期刊 · 年份 */
export const QuoteCard: React.FC<{
  x: number;
  y: number;
  original: string;
  translated: string;
  credit: string;
  from: number;
  color?: string;
  width?: number;
}> = ({ x, y, original, translated, credit, from, color = AMBER, width = 760 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [from, from + 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const dy = interpolate(frame, [from, from + 22], [22, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (o <= 0.01) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        transform: `translate(-50%,${dy}px)`,
        opacity: o,
        borderTop: `1.5px solid ${color}77`,
        borderBottom: `1.5px solid ${color}33`,
        padding: '20px 26px',
        textAlign: 'center',
        background: 'rgba(11,19,34,0.5)',
      }}
    >
      <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 27, letterSpacing: 1, color: SILVER, opacity: 0.86 }}>
        {original}
      </div>
      <div style={{ marginTop: 12, fontFamily: SERIF, fontSize: 33, letterSpacing: 5, color, textShadow: `0 0 20px ${color}55` }}>
        {translated}
      </div>
      <div style={{ marginTop: 14, fontFamily: SANS, fontSize: 20, letterSpacing: 3, color: WARM_WHITE, opacity: 0.5 }}>
        {credit}
      </div>
    </div>
  );
};

/* ---------------- 字幕 / 金句 ---------------- */

const splitAccents = (text: string, accents: string[]) => {
  const parts: { str: string; accent: boolean }[] = [];
  let rest = text;
  while (rest.length > 0) {
    let earliest = -1;
    let matched = '';
    for (const a of accents) {
      const at = rest.indexOf(a);
      if (at !== -1 && (earliest === -1 || at < earliest)) {
        earliest = at;
        matched = a;
      }
    }
    if (earliest === -1) {
      parts.push({ str: rest, accent: false });
      break;
    }
    if (earliest > 0) parts.push({ str: rest.slice(0, earliest), accent: false });
    parts.push({ str: matched, accent: true });
    rest = rest.slice(earliest + matched.length);
  }
  return parts;
};

export const ChunkedSub: React.FC<{
  chunks: string[];
  durationInFrames: number;
  accents?: string[];
  size?: number;
  bottom?: number;
  accentColor?: string;
}> = ({ chunks, durationInFrames, accents = [], size = 49, bottom = 92, accentColor = AMBER }) => {
  const frame = useCurrentFrame();
  const weights = chunks.map((c) => c.length);
  const total = weights.reduce((a, b) => a + b, 0);
  const minWin = 84;
  let cursor = 0;
  let windows = chunks.map((c, i) => {
    const w = Math.max(minWin, (durationInFrames * weights[i]) / total);
    const win = { from: cursor, to: cursor + w };
    cursor += w;
    return win;
  });
  const scale = Math.min(1, durationInFrames / Math.max(1e-6, cursor));
  windows = windows.map((w) => ({ from: w.from * scale, to: w.to * scale }));
  return (
    <>
      {chunks.map((c, i) => {
        const { from, to } = windows[i];
        const opacity = interpolate(frame, [from, from + 10, to - 14, to - 2], [0, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        if (opacity <= 0.01) return null;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              maxWidth: 1740,
              margin: '0 auto',
              opacity,
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: size,
              letterSpacing: 5,
              color: WARM_WHITE,
              textShadow: '0 0 24px rgba(246,241,230,0.3), 0 2px 14px rgba(0,0,0,0.85)',
              whiteSpace: 'pre-wrap',
              textAlign: 'center',
            }}
          >
            {splitAccents(c, accents).map((p, j) => (
              <span
                key={j}
                style={
                  p.accent
                    ? { color: accentColor, textShadow: `0 0 26px ${accentColor}99, 0 2px 14px rgba(0,0,0,0.85)` }
                    : undefined
                }
              >
                {p.str}
              </span>
            ))}
          </div>
        );
      })}
    </>
  );
};

export const QuoteText: React.FC<{
  lines: { text: string; accents?: string[]; accentColor?: string }[];
  from: number;
  size?: number;
  gap?: number;
  defaultAccentColor?: string;
  y?: number;
}> = ({ lines, from, size = 76, gap = 34, defaultAccentColor = AMBER, y = 50 }) => {
  const frame = useCurrentFrame();
  let charIndex = 0;
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap, marginTop: (y - 50) * 6 }}>
        {lines.map((line, li) => {
          const accents = line.accents ?? [];
          const accentColor = line.accentColor ?? defaultAccentColor;
          const flags: boolean[] = new Array(line.text.length).fill(false);
          for (const a of accents) {
            let at = line.text.indexOf(a);
            while (at !== -1) {
              for (let k = 0; k < a.length; k++) flags[at + k] = true;
              at = line.text.indexOf(a, at + a.length);
            }
          }
          return (
            <div
              key={li}
              style={{
                fontFamily: SERIF,
                fontWeight: 600,
                fontSize: size,
                letterSpacing: 10,
                color: WARM_WHITE,
                textShadow: '0 0 34px rgba(246,241,230,0.26), 0 2px 18px rgba(0,0,0,0.85)',
                whiteSpace: 'nowrap',
              }}
            >
              {line.text.split('').map((ch, ci) => {
                const start = from + charIndex++ * 3.4;
                const o = interpolate(frame, [start, start + 16], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                });
                const dy = interpolate(frame, [start, start + 18], [16, 0], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                });
                const accent = flags[ci];
                return (
                  <span
                    key={ci}
                    style={{
                      display: 'inline-block',
                      opacity: o,
                      transform: `translateY(${dy}px)`,
                      color: accent ? accentColor : undefined,
                      textShadow: accent ? `0 0 30px ${accentColor}99, 0 2px 18px rgba(0,0,0,0.85)` : undefined,
                    }}
                  >
                    {ch}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- 核心道具:圆环 ---------------- */

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
};

/** 从 a0 到 a1(顺时针,单位:度,0=正上方)的弧 */
export const arcPath = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const sweep = a1 - a0;
  if (Math.abs(sweep) < 0.05) return '';
  const p0 = polar(cx, cy, r, a0);
  const p1 = polar(cx, cy, r, a1);
  const large = Math.abs(sweep) > 180 ? 1 : 0;
  return `M ${p0.x.toFixed(1)} ${p0.y.toFixed(1)} A ${r} ${r} 0 ${large} ${sweep > 0 ? 1 : 0} ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
};

/**
 * 一个环。gap = 缺口角度(0 表示完全闭合)。
 * closeP: 0..1,把缺口焊到闭合。pulse: 让整环轻微呼吸。
 */
export const Ring: React.FC<{
  cx: number;
  cy: number;
  r: number;
  gap?: number;
  closeP?: number;
  color?: string;
  width?: number;
  opacity?: number;
  pulse?: number;
  frameShift?: number;
  ticks?: number;
}> = ({ cx, cy, r, gap = 62, closeP = 0, color = AMBER, width = 1, opacity = 1, pulse = 0, frameShift = 0, ticks = 0 }) => {
  const frame = useCurrentFrame();
  const f = frame + frameShift;
  const g = Math.max(0, gap * (1 - closeP));
  const breathe = 1 + Math.sin(f * 0.075) * 0.012 * pulse + pulse * 0.02 * Math.sin(f * 0.21);
  const wob = pulse > 0.01 ? Math.sin(f * 0.26) * 1.7 * pulse : 0;
  const rr = r * breathe;
  const closed = g <= 0.4;
  const tickEls =
    ticks > 0 && !closed
      ? Array.from({ length: ticks }, (_, i) => {
          const a = 18 + (i / Math.max(1, ticks - 1)) * (342 - 18);
          const p1 = polar(cx + wob, cy, rr + 12, a);
          const p2 = polar(cx + wob, cy, rr + 26, a);
          return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={color} strokeWidth={2} strokeOpacity={0.3} />;
        })
      : null;
  return (
    <g opacity={opacity}>
      {closed ? (
        <GlowPath d={`M ${cx} ${cy - rr} A ${rr} ${rr} 0 1 1 ${cx - 0.01} ${cy - rr}`} color={color} width={width} bloom={pulse > 0.5 ? 1.25 : 1} />
      ) : (
        <GlowPath d={arcPath(cx + wob, cy, rr, g / 2, 360 - g / 2)} color={color} width={width} bloom={pulse > 0.5 ? 1.3 : 1} />
      )}
      {tickEls}
      {!closed &&
        [g / 2, 360 - g / 2].map((a, i) => {
          const p = polar(cx + wob, cy, rr, a);
          return <circle key={i} cx={p.x} cy={p.y} r={4.5 * width} fill={color} opacity={0.9} />;
        })}
    </g>
  );
};

/** 一圈散落的环:openCount 个还亮着没闭合,其余已闭合熄灭。 */
export const RingField: React.FC<{
  seed?: number;
  count?: number;
  openFrom?: number;
  dimColor?: string;
  brightColor?: string;
  minR?: number;
  maxR?: number;
  keepOpen?: number[];
}> = ({ seed = 7, count = 16, openFrom = 0, dimColor = ICE, brightColor = AMBER, minR = 26, maxR = 74, keepOpen = [] }) => {
  const frame = useCurrentFrame();
  const items = React.useMemo(() => {
    const r = makeRand(seed);
    return Array.from({ length: count }, (_, i) => ({
      x: 140 + r() * 1640,
      y: 140 + r() * 700,
      rad: minR + r() * (maxR - minR),
      gap: 40 + r() * 70,
      rot: r() * 360,
      ph: r() * Math.PI * 2,
      open: i % 2 === 0,
      i,
    }));
  }, [seed, count, minR, maxR]);
  return (
    <GlowSvg>
      {items.map((it) => {
        const open = it.open || keepOpen.includes(it.i);
        const appear = span(frame, openFrom + it.i * 5, openFrom + it.i * 5 + 26);
        if (open) {
          const pulse = 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.05 + it.ph));
          return (
            <Ring
              key={it.i}
              cx={it.x}
              cy={it.y}
              r={it.rad}
              gap={it.gap}
              color={brightColor}
              width={0.8}
              opacity={appear * (0.5 + pulse * 0.5)}
              pulse={pulse}
              frameShift={it.i * 3}
            />
          );
        }
        return (
          <Ring
            key={it.i}
            cx={it.x}
            cy={it.y}
            r={it.rad * 0.8}
            gap={0}
            color={dimColor}
            width={0.55}
            opacity={appear * 0.3}
          />
        );
      })}
    </GlowSvg>
  );
};

