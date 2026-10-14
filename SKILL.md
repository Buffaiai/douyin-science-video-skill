---
name: vibe-knowledge-award
version: "1.0.0"
description: "用 Remotion 代码渲染「Vibe知识大赏」科普动效片（1920x1080/30fps/130~160s 横屏，无配音无小人，视觉隐喻为主 + 底部字幕 + 人文升华收尾），覆盖选题提议、EuropePMC 文献核实、分场文案、工程搭建、静帧构图 QA、整片渲染、色域修正、亮度与音轨质检、发布标题与正文文案、归档清理。当用户要求做 Vibe知识大赏、抖音科普视频、新一期成片、Remotion 动效、被限流/画面低质、要发布标题文案，或问下期做什么选题时使用。"
argument-hint: "<选题或期号；不给则先提 3~5 个候选选题>"
---

# 「Vibe知识大赏」科普动效片（Remotion 代码渲染）

## Overview

把一条核实过的心理学/物理/数学结论，做成一支具象视觉隐喻驱动的横屏动效片并交付发布文案。
产出必须同时满足：**戳中普通人的情感现场 · 有可核实的文献支撑 · 有一句值得截图转发的升华收尾**。

验收方（用户）的偏好已经很确定：**只在选题这一步做决定**，其余环节一次做完直接交付，不要逐步请示；
说「预览」时要的就是最终规格的 1080p 成片本身，不接受静态分镜图或低清预览版。

## 定义「完成」

一期 = 四样东西，缺一不可：

1. `<topic>-video/SCRIPT.md` — 分场文案 + 事实核查表
2. `<topic>-video/src/**` — 可复渲的工程源码
3. `YYYY-MM-DD/<中文片名>.mp4` — 1080p、色域已修、音轨已混
4. `<topic>-video/DELIVERY.md` — 发布标题（1 主推 + 2 备选）+ 正文文案 + 发布提醒 + 质检记录

## 工作流

先在工作目录（一般就是用户的项目根）确认是否已有当期工程；新期从第 1 步开始。

```bash
# 0 选题：给 3~5 个候选（钩子句 × 概念 × 视觉母题），等用户挑。参考 references/topic-library.md
# 1 文献核实（这一步决定文案里能出现哪些数字）
scripts/paper.sh find "<精确短语>"     # 先定论断
scripts/paper.sh pmid <PMID>          # 写进片子的每个编号都必须反查

# 2 写 SCRIPT.md：先列视觉母题与逐场画面，再写字幕（画面在前）
# 3 搭工程
scripts/new_episode.sh <topic-slug> <CompId> <水印四字> --dir <工作目录> --title <中文片名>
#    → 之后改 src/theme.ts（每期重设配色）、src/timing.ts（场次与帧数）、src/components/*（母题道具）
# 4 构图 QA（必须先过这关，比整片渲染快得多）
scripts/stills.sh <topic>-video 12     # 出 /tmp/douyin-qa/.../sheet.jpg，逐张看并裁剪放大关键部位
# 5+6 整片渲染 → 色域修正 → 混音 → 质检 → 清理，一条命令
scripts/finalize.sh <topic>-video YYYY-MM-DD/<中文片名>.mp4 [audio.wav]
#    不带音频时自动找 <工作目录>/s.wav
# 7 写 DELIVERY.md  8 交付（见 references/delivery-format.md）
```

`finalize.sh` 末尾会跑 `qa.sh`，任何一项 FAIL 就回第 4 步修，**不要交付**。

## 硬性规则（违反过，别再犯）

**内容**
- 开场用第二人称情感悬念句，不用概念名；「为什么 / 你以为 / 其实」这类反转词进标题。
- 一个**视觉母题贯穿全片**（第 0 帧出现，片尾完成它），不是一堆互不相干的图解。
- 必须有「诚实边界」场：复现失败、只有相关性、效应量微小的要明说。
- 实用建议若查不到文献，写成「按机制反推的做法」并明标，不冒充实验结论。
- 结尾金句用中央大字定格；**片尾不放「Vibe知识大赏」等活动落版**。

**画面**
- 主体是具象视觉隐喻。文字只许三种形态：底部一行字幕、数据/出处角标、金句中央大字。
- **绝不画小人**（人形剪影/火柴人/五官四肢）。情感场景用门、光、笼子、动物、物件替代。
- 第 0 帧就要有完整内容，不许全黑淡入。右上角常驻 4 字主题水印。
- 配色每期按选题重设，但明度有硬下限：底 `#10~#14` 量级、中心 `#26~#35`，不要近黑。
- 工程内不做配音、不加 BGM；交付时若有音频文件就混进成片（截到与画面同止）。

**发布标题**：含「Vibe知识大赏」前缀与标点在内 **≤30 字**，建议 19~21 字。

## 三条不能妥协的质检线

| 项 | 通过线 | 为什么 |
|---|---|---|
| 亮度 | 全片 YAVG **30~60**，无 <35 段落 | 近黑 + 细发光线 = 抖音判「画面低质」限流 |
| 色域 | `yuv420p/tv/bt709`，且 SPS 三项 = 1 | 标签错会让亮度掉一半，抬亮度白抬 |
| 音轨 | 有 AAC 轨且长度 = 视频长度 | 静音是「无完整内容」的直接信号 |

## Resources

- `references/creative-rules.md` — 选题钩子公式、分场结构、母题纪律、数据经验（写 SCRIPT.md 前读）
- `references/fact-checking.md` — EuropePMC 用法、"取不到数值就不写"规则、已核实论文清单、核不了的死路
- `references/render-qa.md` — 渲染/色域/混音手工命令与阈值、五条实测踩过的坑、SVG viewBox 裁剪纪律
- `references/delivery-format.md` — SCRIPT.md 与 DELIVERY.md 逐字段模板、归档命名与清理范围
- `references/topic-library.md` — 已做 20 期（含母题，避免重复）、待核实候选选题
- `assets/template/` — Remotion 工程骨架：`kit.tsx` 已含背景/颗粒/辉光路径/发光球/字幕分块/金句逐字/圆环/角标/印章/出处卡等通用组件
- `scripts/new_episode.sh` `stills.sh` `finalize.sh` `qa.sh` `paper.sh`（+ `europepmc.py`）
- 不通过 skill 机制使用这份包时，读根目录 `AGENTS.md`（同一入口的纯指令版）；`README.md` 是面向人的安装与依赖说明

模板依赖 Remotion 4.0.356 + Chrome；`node_modules` 默认复用工作目录里已有的真身（软链绝对路径），没有则 npm install。
`src/timing.ts` 里 `SCENE_DURATIONS` 要保持两空格缩进的 `key: 帧数,` 格式，`stills.sh` 靠它算抽帧位置。
