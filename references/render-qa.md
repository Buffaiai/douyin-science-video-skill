# 渲染与质检

流水线脚本已经封好（`scripts/stills.sh`、`scripts/finalize.sh`、`scripts/qa.sh`）。这一页是它们背后的原因和手工兜底命令。

## 为什么这些参数不能改

抖音会把「大面积纯黑 + 细发光线条 + 无声」的代码动效片判为**画面低质 → 流量减少**（实测踩过一次）。两个高危信号：

1. **太黑**：整片 YAVG 落在 6~20（255 制）会被读成"画质模糊/压缩伪影"。
   - 背景抬到深蓝/深灰，别用 `#04060d` 一类近黑。
   - 第 0 帧就要有完整内容。
   - 叠一层 `feTurbulence` 胶片颗粒（overlay, opacity 0.14, 逐帧位移）打散暗部 banding。
   - 渲染 `--crf=15 --jpeg-quality=100`（Remotion 默认 crf18 + jpeg80 会二次压缩）。实测安全区：**YAVG 30~60**。
2. **无声**：音轨 -91dB 的静音版是「无完整内容」的直接信号。发布前必须混配音/BGM。

**色域**：Remotion 出的是 `yuvj420p / pc / bt470bg`，1080p 应为 `yuv420p / tv / bt709`。标签错了播放器用错亮度矩阵，实测同一帧 YAVG 从 42.9 掉到 31.8，抬亮度白抬。

## 手工命令（脚本不满足时）

```bash
# 整片渲染
npx remotion render src/index.ts <CompId> out/raw.mp4 --crf=15 --jpeg-quality=100

# 色域修正：三项必须走 -x264-params
ffmpeg -y -i out/raw.mp4 -vf "scale=out_range=tv:out_color_matrix=bt709,format=yuv420p" \
  -c:v libx264 -preset slow -crf 15 \
  -x264-params "colorprim=bt709:transfer=bt709:colormatrix=bt709:range=limited" \
  -an -movflags +faststart out/graded.mp4

# 混音：视频流 copy，音频截到与画面同止
ffmpeg -y -i out/graded.mp4 -i s.wav -c:v copy -c:a aac -b:a 192k -t <视频秒数> 最终片.mp4
```

## 质检命令

```bash
ffprobe -select_streams v -show_entries stream=pix_fmt,color_range,color_space,color_primaries,color_transfer <final>
# 五项齐平 yuv420p / tv / bt709 / bt709 / bt709

# SPS 真值：只有 color_space 显示 bt709 不算数
ffmpeg -y -i <final> -bsf:v trace_headers -frames:v 1 -c:v copy /tmp/probe.mkv 2>&1 | grep -E 'colour_primaries|transfer_characteristics|matrix_coefficients'
# 三项都应是 1；出现 =2 说明裸旗标被 x264 落成 unspecified
# 注意：-f null 走 wrapped_avframe，trace_headers 不支持，必须 -c:v copy 落进真实容器
# 注意：别加 -v error，会把 trace 输出一起吞掉

ffmpeg -i <final> -vf "fps=1/5,signalstats,metadata=print:key=lavfi.signalstats.YAVG" -f null -
```

## 五条实测踩过的坑

1. **zsh 的 `nomatch` 会中断整条 `&&` 链**。`rm -f out/*.mp4 && remotion render ...` 在 out/ 为空时直接报 `no matches found`，**渲染根本没跑**，而后台任务仍 exit 0——白等一轮。删文件写死具体名字；渲染命令单独成条。
2. **`remotion still` 的输出扩展名必须与 `--image-format` 一致**：`--image-format=jpeg` 配 `x.png` 抛 `Image format mismatch`。QA 抽帧统一 `.jpg`。
3. **`--log=silent` 是非法取值**，会让批量抽帧全部失败，被 `>/dev/null 2>&1` 吞掉后看起来像"渲染没出图"。用 `--log=error`。
4. **contact sheet 用 concat demuxer + `tile`**：`ffmpeg -f concat -safe 0 -i list.txt -vf "scale=W:-1,tile=3x5" sheet.jpg`。`xstack`、`x3=` 这类写法本机 ffmpeg 没有。混合宽高先 `scale=...:force_original_aspect_ratio=decrease,pad=...` 再 tile，否则 pad 报 "Padded dimensions cannot be smaller"。
5. **静帧亮度 ≠ 成片亮度**：`yuvj420p/pc` 转 `yuv420p/tv` 时亮度被抬进 16–235，实测静帧 39~51 → 成片 52.9~60.1（约低 10）。**别拿静帧数值判断成片偏不偏暗**。

## SVG 图形纪律

坐标落在 viewBox 之外会被**静默裁掉**（SVG 默认 overflow hidden），不报错。历史上人物头部用负坐标绘制，交付后才发现整头缺失；而把整帧交给视觉模型描述时，无头人形被读成"兀""毛巾""衬衫"，反而漏检。

- 绘制前用实际坐标算内容包围盒，确认在 viewBox 内。
- QA 时把关键部位**裁剪放大**单独看，不要只看整帧。
- 一处此类 bug，要连带排查同期所有同类组件。
- 分岔树/网格这类按索引定位的图形，注意索引算法要与层结构一致（本期踩到过分岔树定位写成线性而非按层 2^n）。
