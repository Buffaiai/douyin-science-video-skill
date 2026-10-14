#!/usr/bin/env bash
# 构图 QA：均匀抽 N 张 1080p 静帧并拼 contact sheet（比整片渲染快得多，必须先过这关）。
#   stills.sh <project-dir> [count=12]
# 输出目录固定在 /tmp，不进项目目录，省得留垃圾。
set -euo pipefail
PROJ="${1:?用法: stills.sh <project-dir> [count=12]}"
COUNT="${2:-12}"
PROJ="$(cd "$PROJ" && pwd)"
NAME="$(basename "$PROJ")"

COMP_ID=$(grep -oE 'id="[^"]+"' "$PROJ/src/Root.tsx" | head -1 | sed 's/id="//;s/"//')
TOTAL=$(grep -E '^  [A-Za-z0-9_]+: *[0-9]+,?$' "$PROJ/src/timing.ts" | grep -oE '[0-9]+' \
  | awk '{s+=$1} END{print s+0}')
[ "$TOTAL" -gt 0 ] || { echo "FAIL: 取不到总帧数。timing.ts 的 SCENE_DURATIONS 要保持两空格缩进的「key: 帧数,」格式"; exit 1; }

D="/tmp/douyin-qa/$NAME"
rm -rf "$D"; mkdir -p "$D"
echo "整片 $TOTAL 帧，抽 $COUNT 张 → $D"

for i in $(seq 1 "$COUNT"); do
  f=$(( TOTAL * (2*i-1) / (2*COUNT) ))
  # --image-format=jpeg 必须配 .jpg 扩展名；--log=silent 是非法取值
  (cd "$PROJ" && npx remotion still src/index.ts "$COMP_ID" "$D/f$(printf '%02d' $i).jpg" \
    --frame="$f" --image-format=jpeg --log=error >/dev/null)
done

ls "$D"/f*.jpg | sort | awk '{print "file '"'"'" $1 "'"'"'"}' > "$D/list.txt"
COLS=3; ROWS=$(( (COUNT + COLS - 1) / COLS ))
ffmpeg -y -v error -f concat -safe 0 -i "$D/list.txt" \
  -vf "scale=640:-1:force_original_aspect_ratio=decrease,pad=640:360:(ow-iw)/2:(oh-ih)/2:color=0x101f24,tile=${COLS}x${ROWS}" \
  "$D/sheet.jpg"

echo "OK  contact sheet: $D/sheet.jpg"
echo "逐张：$D/f01.jpg .. $D/f$(printf '%02d' $COUNT).jpg"
echo "看片纪律：图形关键部位要裁剪放大单独看（SVG 坐标出 viewBox 会被静默裁掉，整帧描述会漏检）"
