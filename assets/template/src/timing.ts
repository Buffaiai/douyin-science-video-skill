export const FPS = 30;

/** 每期 8~9 场、单场 330~660 帧,总片长 130~160s。场景 key 必须与 Video.tsx 的顺序一致。 */
export const SCENE_DURATIONS = {
  hook: 330,
  mechanism: 480,
  ending: 330,
};

export const TOTAL_FRAMES = Object.values(SCENE_DURATIONS).reduce((a, b) => a + b, 0);

export const ease = {
  out: (t: number) => 1 - Math.pow(1 - t, 3),
  in: (t: number) => t * t * t,
  inOut: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
};

/** clamp + 把帧窗 [a,b] 归一化到 0..1 */
export const span = (f: number, a: number, b: number) =>
  Math.max(0, Math.min(1, (f - a) / Math.max(1e-6, b - a)));
