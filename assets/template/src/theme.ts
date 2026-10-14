/**
 * 每期按选题重设色值与语义命名(这里只给一套可用的默认槽位)。
 * 硬性下限:BG_DEEP 不能低于 ~#10 明度、BG_MID 落在 #26~#35,否则会被抖音判「画面低质」限流。
 * 语义色固定四个槽,换选题时换名字注释与色相即可,组件层不用动。
 */
export const BG_DEEP = '#101f24';
export const BG_MID = '#28474c';
export const BG_EDGE = '#060d10';

/** 主高亮 / 关键词 / 水印(通常是暖金) */
export const AMBER = '#ffc978';
export const AMBER_SOFT = 'rgba(255,201,120,0.55)';
export const AMBER_DIM = 'rgba(255,201,120,0.24)';

/** 冷色对照 / 已解决 / 平静(冰蓝或薄荷) */
export const ICE = '#7fe0c8';
export const ICE_SOFT = 'rgba(127,224,200,0.52)';
export const ICE_DIM = 'rgba(127,224,200,0.22)';

/** 冲突 / 痛点 / 失控(朱红) */
export const ROSE = '#ff7d72';
export const ROSE_SOFT = 'rgba(255,125,114,0.55)';
export const ROSE_DIM = 'rgba(255,125,114,0.24)';

/** 收尾的光 */
export const DAWN = '#ffab5e';

export const SILVER = '#e9eef7';
export const SILVER_DIM = 'rgba(233,238,247,0.24)';
export const WARM_WHITE = '#f6f1e6';
export const DIM = 'rgba(246,241,230,0.42)';
export const FAINT = 'rgba(246,241,230,0.22)';

export const SERIF = '"Songti SC", "STSong", "Noto Serif SC", serif';
export const SANS = '"PingFang SC", "Helvetica Neue", sans-serif';
export const MONO = '"SF Mono", "Menlo", "Courier New", monospace';
