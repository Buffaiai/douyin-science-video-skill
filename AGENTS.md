# 给 Agent 的入口（不限框架）

本仓库是一份可被任何 coding agent 使用的创作技能包：**用 Remotion 代码渲染「Vibe知识大赏」科普动效片**。
不需要 skill 机制也能用——按下面的顺序读文件、按命令执行即可。

## 你要做的事

你的产出是一期完整交付，四样缺一即返工：

1. `<topic>-video/SCRIPT.md` — 分场文案 + EuropePMC 事实核查表
2. `<topic>-video/src/**` — 可复渲的 Remotion 工程
3. `YYYY-MM-DD/<中文片名>.mp4` — 1080p、色域已修、音轨已混
4. `<topic>-video/DELIVERY.md` — 发布标题（1 主推 + 2 备选，≤30 字含前缀）+ 正文文案 + 发布提醒 + 质检记录

## 阅读顺序

先读 `SKILL.md`（完成定义、八步工作流、硬规则、三条质检线），再按当前步骤**只加载需要的那一份**：

| 何时读 | 文件 |
|---|---|
| 提议选题、写分场文案前 | `references/creative-rules.md`、`references/topic-library.md` |
| 写任何数字/出处前 | `references/fact-checking.md` |
| 渲染与质检 | `references/render-qa.md` |
| 写交付文案、归档清理 | `references/delivery-format.md` |

## 执行入口

```bash
scripts/paper.sh find "<精确短语>" | pmid <PMID> | doi <DOI>    # 文献核实
scripts/new_episode.sh <slug> <CompId> <水印四字> --dir <工作目录> [--modules <node_modules 绝对路径>]
scripts/stills.sh <slug>-video 12                               # 构图 QA，产物在 /tmp
scripts/finalize.sh <slug>-video YYYY-MM-DD/<中文片名>.mp4 [audio.wav]
scripts/qa.sh <final.mp4>                                       # 单独复检
```

脚本失败会打印 `FAIL ...` 并返回非 0，原因写在消息里；不要绕过质检线交付。

## 移植到新环境时要改的三处

1. `assets/template/remotion.config.ts` 里的 Chrome 可执行路径。
2. `assets/template/package.json` 依赖 Remotion 4.0.356；若目标环境没有现成 `node_modules`，`new_episode.sh` 会自动 `npm install`。
3. EuropePMC 之外没有备用文献源（多数索引接口被墙）；`scripts/paper.sh` 用 `curl` 发包、`python3` 解析 stdin，别改回 python 直连 https。

## 最容易失分的四条

- 开场必须是第二人称情感悬念句，不是概念名；标题含前缀与标点 ≤30 字。
- **一个视觉母题贯穿全片**，第 0 帧出现、片尾完成它；不许堆互不相干的图解。
- **绝不画小人**（人形剪影/火柴人/五官四肢），情感场景用门、光、笼子、动物、物件替代。
- 摘要取不到的数值一律不写，只讲方向；复现失败与证据不足要单独成场说明。

配色与构图的具体基线、色域命令、静帧亮度陷阱等在 `references/render-qa.md`；每期交付当轮必须清掉抽帧图、contact sheet、raw/graded 中间 mp4 与项目 `out/` 内容。
