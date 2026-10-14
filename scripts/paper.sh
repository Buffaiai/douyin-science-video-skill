#!/usr/bin/env bash
# EuropePMC 事实核查（本机只有这个通道可用；Crossref/Wikipedia/PubMed 被拦）。
#   paper.sh find "<精确短语>" [条数=6]
#   paper.sh pmid <PMID>   # 文案里出现的每个编号都要先这样反查作者与标题
#   paper.sh doi  <DOI>
set -euo pipefail
MODE="${1:?用法: paper.sh find|pmid|doi ...}"
Q="${2:?缺少查询词/编号}"
N="${3:-6}"

case "$MODE" in
  find) QUERY="$Q" ;;
  pmid) QUERY="EXT_ID:$Q AND SRC:MED" ;;
  doi)  QUERY="DOI:\"$Q\"" ;;
  *) echo "未知模式 $MODE（只支持 find/pmid/doi）"; exit 2 ;;
esac

curl --max-time 40 -sS -G "https://www.ebi.ac.uk/europepmc/webservices/rest/search" \
  --data-urlencode "query=$QUERY" \
  --data-urlencode "format=json" \
  --data-urlencode "resultType=core" \
  --data-urlencode "pageSize=$N" \
  | python3 "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/europepmc.py" "$MODE"
