#!/usr/bin/env bash
# 从模板新建一期工程。
#   new_episode.sh <topic-slug> <CompId> <水印四字> [--dir <workdir>] [--modules <node_modules>] [--title <中文片名>]
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TOPIC="${1:?用法: new_episode.sh <topic-slug> <CompId> <水印四字> [--dir DIR] [--modules PATH] [--title 中文名]}"
COMP_ID="${2:?缺少 CompId(PascalCase,如 ChoiceOverload)}"
WATERMARK="${3:?缺少右上角常驻水印(4 个汉字,如 选择过载)}"
shift 3

WORKDIR="$PWD"
MODULES=""
TITLE="$TOPIC"
while [ $# -gt 0 ]; do
  case "$1" in
    --dir) WORKDIR="$2"; shift 2 ;;
    --modules) MODULES="$2"; shift 2 ;;
    --title) TITLE="$2"; shift 2 ;;
    *) echo "未知参数: $1"; exit 2 ;;
  esac
done

DEST="$WORKDIR/${TOPIC}-video"
[ -e "$DEST" ] && { echo "FAIL: $DEST 已存在,不换骨架"; exit 1; }

mkdir -p "$WORKDIR"
WORKDIR="$(cd "$WORKDIR" && pwd)"
DEST="$WORKDIR/${TOPIC}-video"
cp -R "$SKILL_DIR/assets/template" "$DEST"

# node_modules:优先复用工作目录里已有的真身,避免重复安装;软链一律用绝对路径,跨目录也不会断
if [ -z "$MODULES" ]; then
  for c in "$WORKDIR"/*/node_modules; do
    if [ -d "$c" ] && [ ! -L "$c" ]; then MODULES="$(cd "$c" && pwd)"; break; fi
  done
fi
if [ -n "$MODULES" ]; then
  [ -d "$MODULES" ] || { echo "FAIL: --modules 指向的目录不存在: $MODULES"; exit 1; }
  MODULES="$(cd "$MODULES" && pwd)"
  ln -s "$MODULES" "$DEST/node_modules"
  echo "node_modules -> $MODULES"
else
  (cd "$DEST" && npm install --no-audit --no-fund >/dev/null 2>&1) && echo "已 npm install"
fi

# BSD(macOS) 的 sed -i 要吃一个空参数，GNU(Linux) 的不吃
sedi() {
  if sed --version >/dev/null 2>&1; then sed -i "$@"; else sed -i '' "$@"; fi
}
sedi -e "s/__TOPIC__/$TOPIC/g" \
     -e "s/__COMP_ID__/$COMP_ID/g" \
     -e "s/__WATERMARK__/$WATERMARK/g" \
     "$DEST/package.json" "$DEST/src/Root.tsx" "$DEST/src/Video.tsx"

cat > "$DEST/SCRIPT.md" <<EOF
# <期号> · $WATERMARK（$TITLE）

选题：情感悬念「」 × 硬核机制「」 × 人文升华「」
成片规格：1920×1080 / 30fps / ____ 帧（___s）/ 横屏
水印（右上角常驻）：$WATERMARK
视觉母题（单一贯穿）：____________（从第 0 帧用到片尾）。全片无小人。
EOF
cat >> "$DEST/SCRIPT.md" <<'EOF'

---

## 分场文案（字幕逐块）

### 1. hook · ___f
画面：
-
-
-

## 事实核查清单（EuropePMC 在线核实）

| 论断 | 出处 | 状态 |
|---|---|---|
|  | DOI / PMID | 摘要核实 ✓ / 只取到首句（不写数字）/ 查不到（弃用） |

**刻意不写进文案的**：
EOF

cat > "$DEST/DELIVERY.md" <<EOF
# 交付文案 · $WATERMARK（$TITLE）

## 发布标题（≤30 字，带钩子）

主推（__ 字）：「Vibe知识大赏」
备选 1（__ 字）：「Vibe知识大赏」
备选 2（__ 字）：「Vibe知识大赏」

## 正文

（钩子一句 → 反常识事实 → 机制一句 → 金句收尾 → 一行出处 → 话题标签）

#Vibe知识大赏  #心理学 #认知偏差 #自我认知 @抖音科技

## 发布提醒

- 封面建议：
- 评论区置顶提问：**「」**
- 本期争议点与可直接回复的出处：

## 质检记录

- 成片：
- 色域标签：
- 画面亮度：
- 人物合规：全片无小人
- QA：
- 文献：
- 主动弃用：
- 音频素材：
EOF

echo "OK: 已生成 $DEST"
echo "下一步：1) 核实文献 scripts/paper.sh  2) 改 src/theme.ts + timing.ts + components/  3) scripts/stills.sh 做构图 QA"
