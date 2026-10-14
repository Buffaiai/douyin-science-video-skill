#!/usr/bin/env python3
"""解析 EuropePMC 的 JSON（从 stdin 读）。查询由 paper.sh 用 curl 发出——
本机 python 直连 https 会缺 CA 证书，curl 不受影响。"""
import json
import sys


def show(h):
    ab = (h.get("abstractText") or "").replace("\n", " ")
    journal = h.get("journalTitle") or (h.get("bookOrReportDetails") or {}).get("publisher") or "-"
    print("-" * 78)
    print(f'{h.get("pubYear")} | PMID {h.get("pmid") or "-"} | {h.get("doi") or "-"} | {journal}')
    print(f'  {h.get("title")}')
    print(f'  {(h.get("authorString") or "")[:110]}')
    thin = "  ← 摘要太短/取不到 → 数值一律不写，只讲方向，不给百分比" if len(ab) < 300 else ""
    print(f'  开放获取 {h.get("isOpenAccess", "N")} | 摘要 {len(ab)} 字符{thin}')
    if ab:
        print("  摘要片段：" + ab[:600])
    dbs = [d for d in (h.get("database") or []) if d in ("PMC", "MANUSCRIPT")]
    if dbs:
        print(f"  全文可取：{', '.join(dbs)}")


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "find"
    raw = sys.stdin.read().strip()
    if not raw:
        raise SystemExit("FAIL 空响应：EuropePMC 没返回内容，检查网络或查询词")
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        raise SystemExit("FAIL 返回不是 JSON（可能被网关拦了）。原文前 200 字符：\n" + raw[:200])
    rl = data.get("resultList") or {}
    hits = rl.get("result") or data.get("hitList") or []
    print(f'命中 {data.get("hitCount", 0)} 条，显示前 {len(hits)} 条')
    if not hits:
        print("→ 0 命中：这个方向核不了。写进「主动弃用」，不要靠记忆补。")
        return
    for h in hits:
        show(h)
    if mode == "pmid":
        print("\n※ 反查用途：确认上面这条的作者/标题/年份与你要引用的那篇一致，否则 PMID 写错就是硬伤。")


if __name__ == "__main__":
    main()
