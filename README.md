# 「Vibe知识大赏」科普动效片 · Agent Skill

用 Remotion 把一条核实过的科学结论做成一支 **1920×1080 / 30fps / 130~160s 横屏**的代码渲染动效片（抖音「Vibe知识大赏」赛道风格：视觉隐喻为主、底部字幕、无配音无小人、人文升华收尾），并交付发布标题与正文文案。

这套流程是从 20 期成片里沉淀出来的，包含被平台限流教育过的亮度/色域基线、EuropePMC 文献核查规则，以及一批反复重写的确定性脚本。

## 任何 agent 都能用

`SKILL.md` 用的是通用 Agent Skill 格式（YAML frontmatter + markdown 指令），Codex / Claude Code / Qoder / Trae / Cursor 等都按同一约定识别。
不支持 skill 机制的 agent，直接读根目录的 [`AGENTS.md`](AGENTS.md)——它是同一份入口的纯指令版。

装到各自的 skills 目录即可（真身放一处、其余软链）：

```bash
git clone https://github.com/<you>/vibe-knowledge-award.git /tmp/dsv
mkdir -p ~/.agents/skills && cp -R /tmp/dsv ~/.agents/skills/vibe-knowledge-award
ln -sfn ~/.agents/skills/vibe-knowledge-award ~/.codex/skills/vibe-knowledge-award      # Codex
ln -sfn ~/.agents/skills/vibe-knowledge-award ~/.claude/skills/vibe-knowledge-award     # Claude Code
ln -sfn ~/.agents/skills/vibe-knowledge-award ~/.qoder-cn/skills/vibe-knowledge-award   # Qoder
```

## 依赖

- Node + `npx remotion`（工程锁 4.0.356）、Chrome（`remotion.config.ts` 里的路径按机器改）
- `ffmpeg` / `ffprobe`（色域修正与质检）
- `python3` + `curl`（EuropePMC 查询；`curl` 发包、python 只解析——本机 python 直连 https 会缺 CA 证书）
- macOS 与 Linux 均可：脚本已自动适配 BSD / GNU 的 `sed -i`

## 目录

```
SKILL.md                    入口：完成定义、八步工作流、硬规则、质检线
AGENTS.md                   给不支持 skill 的 agent 的同义入口
assets/template/            Remotion 工程骨架（kit.tsx 已含 20 期沉淀的通用组件）
references/
  creative-rules.md         钩子公式、分场结构、视觉母题纪律、数据经验
  fact-checking.md          EuropePMC 用法、「取不到数值就不写」、已核实论文清单、核不了的死路
  render-qa.md              渲染/色域/混音命令与阈值、五条实测踩过的坑、SVG viewBox 纪律
  delivery-format.md        SCRIPT.md 与 DELIVERY.md 逐字段模板、归档命名与清理范围
  topic-library.md          已做 20 期（含母题，避免重复）+ 待核实候选选题
scripts/
  new_episode.sh            脚手架：换占位符、复用 node_modules、生成两份 md 骨架
  stills.sh                 均匀抽 N 张 1080p 静帧并拼 contact sheet（构图 QA）
  finalize.sh               整片渲染 → 色域修正 → 混音 → 质检 → 清中间件
  qa.sh                     色域五项 + SPS 真值 + 全片亮度 + 首帧 + 音轨
  paper.sh / europepmc.py   EuropePMC 检索与 PMID 反查
```

## 六条命令跑完一期

```bash
scripts/paper.sh find "<精确短语>"                       # 1 文献核实
scripts/paper.sh pmid <PMID>                             #   写进片子的编号必须反查
scripts/new_episode.sh <slug> <CompId> <水印四字> --dir <工作目录>   # 2~3 脚手架
#    然后改 src/theme.ts、src/timing.ts、src/components/*
scripts/stills.sh <slug>-video 12                        # 4 构图 QA
scripts/finalize.sh <slug>-video YYYY-MM-DD/<片名>.mp4   # 5~8 渲染到质检到清理
```

## 三条不可妥协的质检线

| 项 | 通过线 | 原因 |
|---|---|---|
| 亮度 | 全片 YAVG **30~60**，无 <35 段落 | 近黑 + 细发光线会被抖音判「画面低质」限流 |
| 色域 | `yuv420p/tv/bt709` 且 SPS 三项 = 1 | 标签错会让亮度掉一半 |
| 音轨 | 有 AAC 轨且长度 = 视频长度 | 静音是「无完整内容」的直接信号 |

细节与原因都在 `references/`。改动这套阈值前，先读 `references/render-qa.md`。
