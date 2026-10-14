#!/usr/bin/env bash
# 成片质检：色域五项 + SPS 真值 + 全片亮度 + 音轨。不过线就不要交付。
#   qa.sh <final.mp4>
set -euo pipefail
F="${1:?用法: qa.sh <final.mp4>}"
[ -f "$F" ] || { echo "FAIL: 找不到 $F"; exit 1; }

fail=0
say() { printf '%s\n' "$1"; }
chk() { # chk <PASS/FAIL label> <actual> <expected>
  if [ "$2" = "$3" ]; then say "  PASS $1 = $2"
  else say "  FAIL $1 = $2 (应为 $3)"; fail=1; fi
}

meta=$(ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate,nb_frames,pix_fmt,color_range,color_space,color_primaries,color_transfer,bit_rate \
  -of default=noprint_wrappers=1 "$F")
g() { printf '%s\n' "$meta" | awk -F= -v k="$1" '$1==k{print $2; exit}'; }

say "== 规格 $(basename "$F") =="
say "  $(g width)x$(g height) / $(g r_frame_rate) / $(g nb_frames) frames / $(du -h "$F" | cut -f1)"
sz=$(g bit_rate); say "  bitrate $((sz/1000000)).$(( (sz%1000000)/100000 )) Mbps"

say "== 色域（必须 yuv420p / tv / bt709 x3）=="
chk pix_fmt   "$(g pix_fmt)"            "yuv420p"
chk range     "$(g color_range)"        "tv"
chk space     "$(g color_space)"        "bt709"
chk primaries "$(g color_primaries)"    "bt709"
chk transfer  "$(g color_transfer)"     "bt709"

# SPS 三项必须为 1、full_range 必须为 0；只有 color_space 显示 bt709 是不够的
# （裸 -color_* 旗标会被 x264 落成 unspecified(2)）。注意 -f null 走 wrapped_avframe，
# trace_headers 不支持，必须 -c:v copy 落进真实容器。
say "== SPS 真值（trace_headers，三项=1、range=0）=="
PROBE="$TMPDIR/qa-sps-probe.mkv"
sps=$( { ffmpeg -y -v info -i "$F" -bsf:v trace_headers -frames:v 1 -c:v copy "$PROBE" 2>&1 \
  | grep -oE '(colour_primaries|transfer_characteristics|matrix_coefficients|video_full_range_flag)[[:space:]]+[^=]+= *[0-9]+' \
  | sed -E 's/[[:space:]]+[^=]+= */=/' | sort -u; } || true )
rm -f "$PROBE"
if [ -z "$sps" ]; then say "  WARN 取不到 SPS（ffmpeg 版本？）"; else
  say "  $(printf '%s' "$sps" | tr '\n' ' ')"
  spsv() { printf '%s\n' "$sps" | awk -F= -v k="$1" '$1==k{print $2; exit}'; }
  for k in colour_primaries transfer_characteristics matrix_coefficients; do
    v=$(spsv "$k")
    if [ "$v" = "1" ]; then say "  PASS $k = 1"; else say "  FAIL $k = ${v:-未找到}（应为 1，bt709）"; fail=1; fi
  done
  r=$(spsv "video_full_range_flag")
  if [ "$r" = "0" ]; then say "  PASS video_full_range_flag = 0（limited）"
  else say "  FAIL video_full_range_flag = ${r:-未找到}（应为 0）"; fail=1; fi
fi

say "== 亮度（全片 YAVG 必须落在 30~60，且无 <35 段落）=="
yv=$( { ffmpeg -i "$F" -vf "fps=1/5,signalstats,metadata=print:key=lavfi.signalstats.YAVG" -f null - 2>&1 \
  | grep -oE 'YAVG=[0-9.]+' | cut -d= -f2; } || true )
if [ -z "$yv" ]; then say "  FAIL 取不到亮度统计"; fail=1; else
  printf '%s\n' "$yv" | awk '
    NR==1{min=$1;max=$1} {s+=$1; if($1<min)min=$1; if($1>max)max=$1; if($1<35)low++}
    END{printf "  samples %d / min %.1f / mean %.1f / max %.1f\n", NR, min, s/NR, max
        if (min<30) {print "  FAIL 最暗处低于 30，会被判画面低质"; exit 1}
        if (low>0)  {printf "  WARN %d 个采样点 <35\n", low}
        if (max>95) {print "  FAIL 有接近过曝的段落"} }' || fail=1
fi

say "== 第 0 帧 =="
f0=$( { ffmpeg -i "$F" -vf "select=eq(n\,0),signalstats,metadata=print:key=lavfi.signalstats.YAVG" -f null - 2>&1 \
  | grep -oE 'YAVG=[0-9.]+' | cut -d= -f2 | head -1; } || true )
say "  YAVG $f0（不许是纯黑场，第 0 帧就要有完整内容）"
awk -v v="$f0" 'BEGIN{exit !(v<25)}' && { say "  FAIL 首帧过暗/疑似黑场淡入"; fail=1; }

say "== 音轨 =="
ast=$(ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,duration -of csv=p=0 "$F" || true)
if [ -z "$ast" ]; then say "  FAIL 无声。发布前必须混入配音或 BGM（静音是「无完整内容」的直接信号）"; fail=1
else say "  PASS $ast"; fi

say ""
if [ "$fail" = 0 ]; then say "QA PASS: $F"; else say "QA FAIL: 回构图/渲染步骤修，不要交付"; fi
exit $fail
