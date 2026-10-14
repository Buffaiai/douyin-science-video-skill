#!/usr/bin/env bash
# 一条命令做完：整片渲染 → 色域修正 → 混音 → 归档 → 质检 → 清中间件。
#   finalize.sh <project-dir> <final-mp4-path> [audio.wav]
# 不带 audio 时会自动找 project 同层的根目录 s.wav。
set -euo pipefail
PROJ="${1:?用法: finalize.sh <project-dir> <final-mp4-path> [audio.wav]}"
OUT="${2:?缺少最终成片路径,如 2026-10-15/中文片名.mp4}"
PROJ="$(cd "$PROJ" && pwd)"
NAME="$(basename "$PROJ")"
AUDIO="${3:-}"

if [ -z "$AUDIO" ]; then
  for c in "$PROJ/../s.wav" "$PROJ/s.wav"; do [ -f "$c" ] && { AUDIO="$(cd "$(dirname "$c")" && pwd)/$(basename "$c")"; break; }; done
fi

BUILD="/tmp/douyin-build/$NAME"
rm -rf "$BUILD"; mkdir -p "$BUILD"
COMP_ID=$(grep -oE 'id="[^"]+"' "$PROJ/src/Root.tsx" | head -1 | sed 's/id="//;s/"//')
[ -n "$COMP_ID" ] || { echo "FAIL: 从 src/Root.tsx 取不到 Composition id"; exit 1; }

echo "[1/5] remotion render $COMP_ID (crf15 + jpeg100)"
# 进度行会刷屏，落盘留日志；失败时才把尾部打出来
if ! (cd "$PROJ" && npx remotion render src/index.ts "$COMP_ID" "$BUILD/raw.mp4" \
  --crf=15 --jpeg-quality=100 --log=error > "$BUILD/render.log" 2>&1); then
  echo "FAIL 渲染失败，日志尾部："
  tail -20 "$BUILD/render.log"
  exit 1
fi

echo "[2/5] 色域修正 → yuv420p/tv/bt709"
# 色域三项必须走 -x264-params；只用 ffmpeg 的 -color_* 旗标会被 x264 落成 unspecified(2)
ffmpeg -y -v error -i "$BUILD/raw.mp4" \
  -vf "scale=out_range=tv:out_color_matrix=bt709,format=yuv420p" \
  -c:v libx264 -preset slow -crf 15 \
  -x264-params "colorprim=bt709:transfer=bt709:colormatrix=bt709:range=limited" \
  -an -movflags +faststart "$BUILD/graded.mp4"

DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$BUILD/graded.mp4")
mkdir -p "$(dirname "$OUT")"

if [ -n "$AUDIO" ] && [ -f "$AUDIO" ]; then
  echo "[3/5] 混入 $AUDIO，截到与画面同止 ${DUR}s"
  # 视频流 copy，保住上一步的色域结论；音频转 AAC
  ffmpeg -y -v error -i "$BUILD/graded.mp4" -i "$AUDIO" \
    -c:v copy -c:a aac -b:a 192k -t "$DUR" -movflags +faststart "$OUT"
else
  echo "[3/5] WARN 没有音频可混，先出静音版（发布前必须补配音/BGM，静音会被限流）"
  cp "$BUILD/graded.mp4" "$OUT"
fi

echo "[4/5] 质检"
rc=0; "$(dirname "${BASH_SOURCE[0]}")/qa.sh" "$OUT" || rc=1

echo "[5/5] 清理中间件"
rm -rf "$BUILD"
[ -d "$PROJ/out" ] && find "$PROJ/out" -type f -delete
echo "成片：$OUT"
[ "$rc" = 0 ] || { echo "注意：质检没过，别交付，按上面的 FAIL 项回炉。"; exit 1; }
