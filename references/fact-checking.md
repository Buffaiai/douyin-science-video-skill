# 事实核查规则

写文案前先做这一步——它直接决定画面里能出现哪些数字。

## 通道

本机只有 **EuropePMC REST** 可用（Crossref / Wikipedia / PubMed 直连被拦）。

```
scripts/paper.sh find "<精确短语>"      # 语义宽查，优先精确短语
scripts/paper.sh pmid <PMID>            # 反查编号（必做）
scripts/paper.sh doi  <DOI>
```
底层是 `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=...&format=json&resultType=core`。
注意 `AUTH:"姓名"` 这类字段查询经常返回语义无关的一堆结果，别用。

## 硬规则

1. **绝不凭记忆写 PMID/DOI**。要出编号，先 `paper.sh pmid <id>` 反查作者/标题/年份是否吻合。
   曾因"记得"某篇 Science 的 PMID 而反查出一篇 BRCA1 论文——写进片子就是硬伤。
2. **摘要取不到数值 → 不写数值**。只讲方向，不给百分比、不给倍数。
   需要画对比时，画"你以为 / 实际"两条柱表达方向，旁边明写一行小字「只标方向 · 不给倍数」——观众看得懂，也不掉坑。
3. **开放获取（isOpenAccess=Y / 有 PMC 全文）才能引具体量**。非 OA 常常只返回摘要首句。
4. **诚实边界要单独成场**。复现失败、只有相关性、效应量微小的，明确说。这既是内容可信度，也是评论区互动来源。
5. **查不到的经典结论**：改写成"按机制反推的做法"并明标机制反推，不冒充实验结论。
6. 0 命中的方向直接进「主动弃用」清单，写在 SCRIPT.md 里，别用"我记得"补上。

## 已确认核不了、别再浪费时间的方向

- 果酱实验（Iyengar & Lepper 2000）的具体百分比：24 种 60% 停下 / 3% 购买 vs 6 种 40% / 30% —— 非 OA，取不到摘要正文。
- `"choice overload"` 与 `"overchoice"` 精确短语：EuropePMC **0 命中**。
- Danziger 2011 以色列假释法官批准率曲线（`parole judges`、`Extraneous Variables in Attention` 都 0 命中）。
- Loftus & Palmer 1974（JVLVB 车速/碎玻璃数字）、Loftus & Pickrell 1995（商场走失比例）。
- Hull 1930s 目标梯度假说、Kivetz & Urminsky 集点卡、Nunes & Drèze 洗车卡、Clark 2009 near-miss（营销学期刊与部分神经科学期刊不在索引内）。

## 已核实、可直接引用的论文（按选题归类）

引用前仍要确认结论方向没被更新研究推翻；编号本身已逐条反查过。

**未完成任务 / 蔡格尼克**
- Zeigarnik 1927, *Psychologische Forschung* 9:1–85, DOI 10.1007/BF02409755（原始条目不在索引，卷页由 Wendsche 2026 的参考文献串确认）
- Wendsche et al. 2026, *Anxiety Stress Coping*, DOI 10.1080/10615806.2026.2616302, PMID 41554526 — 元分析：未完成任务↔下班后工作念头 ρ_between=.382 (k=17,N=2,473)、ρ_within=.247 (k=14,N=12,129)
- Syrek et al. 2017, *J Occup Health Psychol*, DOI 10.1037/ocp0000031, PMID 27101340 — 周底未完成任务经反刍损害周末睡眠
- Ongchoco et al. 2026, *JEP:General* 155(3):649–655, PMID 41490391 — 视觉蔡格尼克；**同刊有更正 PMID 42658604**（未随机排序），只引效应方向
- MacLeod 2020, *Mem Cogn*, DOI 10.3758/s13421-020-01033-5, PMID 32291585 — 效应史重述

**聚光灯效应 / 被注视感**
- Gilovich, Medvec & Savitsky 2000, *JPSP* 78(2):211–222, PMID 10707330 — 原始论文，**是 2000 年 + Medvec，不是 2003 年 + Kruger**；摘要不给倍数，别写"高估两倍"
- Brown & Stopa 2007, *J Anxiety Disord*, PMID 17166695 — 高社会评价条件下聚光灯效应升高
- Macrae et al. 2016, *PSPB* 42(7):855–863, PMID 27149876 — 改视角（远期/第三者）即可削弱
- Castelli & Sarvary 2021, *Ecol Evol*, PMID 33898009, PMC8057329（OA）— 网课不开摄像头首因是担心外表 **N=276/41%**；摘要里"566 undergraduates"是另一份问卷，**别混**
- O'Brien 2026, *Pers Soc Psychol Rev*, PMID 40888361 — 锚定-调整统一模型，支撑"未来的观众"

**动机 / 多巴胺 / 目标梯度**
- Howe et al. 2013, *Nature*, DOI 10.1038/nature12475, PMID 23913271 — 纹状体多巴胺随距离与奖赏大小爬升；**摘要没说"太远就失效"，别反向引申**
- Viard 2011 PMID 21430161（前海马）· Sherrill 2013 PMID 24305826（后海马）· Spiers & Maguire 2007 PMID 17492693（内侧前额叶）— goal proximity
- Vohs et al. 2021, *Psychol Sci*, DOI 10.1177/0956797621989733, PMID 34520296 — 36 实验室 N=3,531，**d=0.06 不显著，数据支持零假设 4:1**（"别神话意志力电池"首选）

**记忆重构 / 再巩固**
- Schacter & Addis 2007, PMID 17395575 · Schacter 2012, PMID 23163437 — 重建性、想象与记忆共用过程
- Hupbach et al. 2007, *Learn Mem*, DOI 10.1101/lm.365707, PMID 17202429 — 提醒后重写清单，**有时间依赖**；只能画"混入"，不能画"忘得更多"
- Nader/Schafe/LeDoux 2000, *Nature*, PMID 10963596 — 取出使用→不稳定态，6 小时后注射无效（窗口期）
- Loftus 2005, *Learn Mem*, PMID 16027179 — 误导信息 30 年综述；警告只在有限条件有效
- Schiller & Phelps 2011, PMID 21629821 — 人类再巩固证据仍少，**诚实边界用这条**
- Chan et al. 2017, *Psychol Sci*, PMID 28895452 — 辟谣元分析 k=52,N=6,878：植入 d=2.41~3.08，辟谣 d=1.14~1.33，**残留 d=0.75~1.06**；自找理由的错误更顽固

**决策疲劳 / 选择过载**
- Iyengar & Lepper 2000, *JPSP*, PMID 11138768 — 只可引论文标题方向 +「买走的更少」
- Yu 2026, *Front Psychol*, PMID 42688180, PMC13534000 — 三波纵向 N=1,512：不安全感→决策疲劳→幸福感↓；ESS 29 国 43,782 人
- Gao et al. 2026, *J Health Psychol*, PMID 42106933 — N=812 护士，夜班/加班/负荷预测决策疲劳（不给系数，条长只表相对强弱）
- Hu et al. 2026, *Patient Prefer Adherence*, PMID 42732318, PMC13570657 — 模型解释 **69.0%** 方差
- Li et al. 2026, *Nurs Open*, PMID 42057246, PMC13128968 — 心理资本中介占总效应 **34.82%**

**睡眠 / 自控**
- Kroese et al. 2014, *Front Psychol* — 睡前拖延概念与量表
- Yoo et al. 2007, *Curr Biol* — 睡眠剥夺使杏仁核反应放大约 +60%
