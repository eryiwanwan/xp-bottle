/* 从 index.html 抽出 DECKS，生成可读的词表文档。
   改完词表后跑：node tools/make-words.js */

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const m = html.match(/var DECKS = (\{[\s\S]*?\n  \});/);
if (!m) {
  console.error("没找到 DECKS，检查 index.html 结构是否变了");
  process.exit(1);
}

const DECKS = eval("(" + m[1] + ")");

const pos = { 0: "主导", 1: "服从", 2: "交换", 3: "幻想" };
let total = 0;

const lines = [];
lines.push("# 词表（用于内容审核）");
lines.push("");
lines.push("> 这份文档由 `node tools/make-words.js` 从 `index.html` 的 `DECKS` 生成。要改词条，改代码再重新生成，别直接改这里。");
lines.push("");
lines.push("改词条的格式是 `[\"词条\", \"分类\", \"瓶型\", \"备注(可选)\"]`。分类只有十个：亲密 / 感官 / 束缚 / 权力 / 言语 / 调教 / 支配 / 道具 / 场景 / 边缘。");
lines.push("");

const catCount = {};
const risky = [];

for (const key of Object.keys(DECKS)) {
  const d = DECKS[key];
  total += d.items.length;
  lines.push(`## ${d.name} · ${key} · ${d.items.length} 项`);
  lines.push("");
  lines.push("| # | 词条 | 分类 | 备注 |");
  lines.push("|---:|---|---|---|");
  d.items.forEach((it, i) => {
    const note = it[3] ? it[3] : "";
    lines.push(`| ${i + 1} | ${it[0]} | ${it[1]} | ${note} |`);
    catCount[it[1]] = (catCount[it[1]] || 0) + 1;
    if (it[1] === "边缘" || /绳|颈|脖|扼|呼吸|蜡|塞|掐|针|电击/.test(it[0])) {
      risky.push({ deck: d.name, name: it[0], note: note });
    }
  });
  lines.push("");
}

lines.push("## 分类分布");
lines.push("");
lines.push("| 分类 | 项数 |");
lines.push("|---|---:|");
Object.keys(catCount)
  .sort((a, b) => catCount[b] - catCount[a])
  .forEach((c) => lines.push(`| ${c} | ${catCount[c]} |`));
lines.push("");

lines.push("## 需要你确认的风险项");
lines.push("");
lines.push("下面这些是**按分类和字面自动筛出来的**，不是最终结论。涉及呼吸、颈部、束缚、温度、堵塞的项，卡片备注里应该有提示，现在几乎全是空的——这一块要你逐条过。");
lines.push("");
lines.push("| 所属 | 词条 | 现有备注 | 建议 |");
lines.push("|---|---|---|---|");
risky.forEach((r) => {
  const suggest = r.note ? "已有，看措辞" : "建议补提示";
  lines.push(`| ${r.deck} | ${r.name} | ${r.note || "—"} | ${suggest} |`);
});
lines.push("");
lines.push(`合计筛出 ${risky.length} 项。`);
lines.push("");

lines.push("## 审核时重点看四件事");
lines.push("");
lines.push("1. **措辞对不对**——你们圈子里是不是这么说的。比如「掌心落在屁股上」是不是太文学了，「寸止」这个词是否通用。");
lines.push("2. **有没有漏**——你们实际会聊到、但这里没有的项。漏了比多了更影响准确度。");
lines.push("3. **有没有不该出现的**——某些项在小范围里成立，但放到公开产品里会让人误解，或者踩到平台线。");
lines.push("4. **风险项有没有标**——涉及呼吸、颈部、束缚的项，备注里该有「需要安全词」这类提示。现在 95 项里只有个别有备注，这一块大概率要补。");
lines.push("");
lines.push(`合计 **${total}** 项。`);

fs.writeFileSync(path.join(root, "词表.md"), lines.join("\n") + "\n", "utf8");
console.log(`词表.md 已生成：${Object.keys(DECKS).length} 套 / ${total} 项`);
