import fs from "node:fs";
import path from "node:path";

const root = path.resolve("..");
const outDir = process.cwd();

const docs = [
  {
    file: "engineering-document-agent-product-plan.md",
    out: "product-plan.html",
    title: "工程行业文档 Agent 产品方案",
    desc: "面向工程行业的 Agent Native 文档任务产品设计。"
  },
  {
    file: "engineering-document-agent-research-notes.md",
    out: "research-notes.html",
    title: "行业调研与场景分析",
    desc: "行业痛点、适合场景、典型输入输出和案例。"
  },
  {
    file: "engineering-document-agent-business-process.md",
    out: "business-process.html",
    title: "业务流程图",
    desc: "从我的项目、项目上下文、资料集成、任务执行、人工审阅到交付沉淀的端到端流程。"
  },
  {
    file: "custom-solution-ppt-generation-flow-details.md",
    out: "custom-solution-ppt.html",
    title: "定制方案生成（PPT）详细流程",
    desc: "定制方案 PPT 的输入输出、数据、知识库、模板、规则、流程与异常处理。"
  },
  {
    file: "product-data-qa-flow-details.md",
    out: "product-data-qa.html",
    title: "产品资料查询（问答）详细流程",
    desc: "产品资料问答的输入输出、数据、知识库、规则、权限、流程与成功标准。"
  }
];

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function inlineMarkdown(value) {
  let s = escapeHtml(value);
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return s;
}

function slugify(text, fallback) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "") || fallback;
}

function parseTable(lines, start) {
  const rows = [];
  let i = start;
  while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
    rows.push(lines[i]);
    i += 1;
  }
  if (rows.length < 2 || !/^\s*\|?\s*:?-{3,}:?\s*\|/.test(rows[1])) {
    return null;
  }
  const parsed = rows.map((row) =>
    row
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim())
  );
  return { rows: parsed, end: i };
}

function tableToHtml(parsed) {
  const [head, , ...body] = parsed.rows;
  const headText = head.join("|");
  if (headText === "架构层级|模块构成") {
    return `<div class="architecture-map">${body.map((row) => {
      const modules = row[1].split(/\s*\/\s*|\s*、\s*/).filter(Boolean);
      return `<section class="arch-row"><div class="arch-label">${inlineMarkdown(row[0])}</div><div class="arch-modules">${modules.map((m) => `<span>${inlineMarkdown(m)}</span>`).join("")}</div></section>`;
    }).join("")}</div>`;
  }
  if (headText === "左侧：任务上下文|中间：Agent 执行区|右侧：结果与风险") {
    return `<div class="three-panel">${head.map((title, index) => `<section class="panel-col"><h4>${inlineMarkdown(title)}</h4><ul>${body.map((row) => `<li>${inlineMarkdown(row[index] || "")}</li>`).join("")}</ul></section>`).join("")}</div>`;
  }
  if (headText === "阶段|价值|产品亮点") {
    return `<div class="value-chain">${body.map((row, index) => `<section class="chain-step"><div class="chain-num">${index + 1}</div><h4>${inlineMarkdown(row[0])}</h4><p>${inlineMarkdown(row[1])}</p><strong>${inlineMarkdown(row[2])}</strong></section>`).join("")}</div>`;
  }
  if (headText === "阶段|价值") {
    return `<div class="value-chain">${body.map((row, index) => `<section class="chain-step"><div class="chain-num">${index + 1}</div><h4>${inlineMarkdown(row[0])}</h4><p>${inlineMarkdown(row[1])}</p></section>`).join("")}</div>`;
  }
  if (headText === "亮点|说明") {
    return `<div class="highlight-grid">${body.map((row) => `<section class="highlight-card"><h4>${inlineMarkdown(row[0])}</h4><p>${inlineMarkdown(row[1])}</p></section>`).join("")}</div>`;
  }
  return `<div class="table-wrap"><table><thead><tr>${head.map((c) => `<th>${inlineMarkdown(c)}</th>`).join("")}</tr></thead><tbody>${body.map((row) => `<tr>${row.map((c) => `<td>${inlineMarkdown(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const toc = [];
  const html = [];
  let paragraph = [];
  let list = [];
  let code = null;
  let codeLang = "";

  function flushParagraph() {
    if (!paragraph.length) return;
    html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  }

  function flushList() {
    if (!list.length) return;
    html.push(`<ul>${list.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</ul>`);
    list = [];
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (code !== null) {
      if (line.startsWith("```")) {
        if (codeLang === "mermaid") {
          html.push(`<div class="diagram-wrap"><pre class="mermaid">${escapeHtml(code.join("\n"))}</pre></div>`);
        } else {
          html.push(`<pre class="code"><code>${escapeHtml(code.join("\n"))}</code></pre>`);
        }
        code = null;
        codeLang = "";
      } else {
        code.push(line);
      }
      continue;
    }

    if (line.startsWith("```")) {
      flushParagraph();
      flushList();
      codeLang = line.slice(3).trim();
      code = [];
      continue;
    }

    const table = parseTable(lines, i);
    if (table) {
      flushParagraph();
      flushList();
      html.push(tableToHtml(table));
      i = table.end - 1;
      continue;
    }

    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      const text = heading[2].trim();
      const id = slugify(text, `section-${toc.length + 1}`);
      if (level <= 3) toc.push({ level, text, id });
      html.push(`<h${level} id="${id}">${inlineMarkdown(text)}</h${level}>`);
      continue;
    }

    const bullet = /^\s*-\s+(.+)$/.exec(line);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1].trim());
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();

  return { html: html.join("\n"), toc };
}

function navHtml(activeOut) {
  return docs.map((doc) => {
    const active = doc.out === activeOut ? " active" : "";
    return `<a class="doc-link${active}" href="${doc.out}"><span>${doc.title}</span><small>${doc.desc}</small></a>`;
  }).join("");
}

function layout({ title, desc, body, toc, activeOut }) {
  const tocHtml = toc.length
    ? `<div class="toc-card"><div class="toc-title">本页目录</div>${toc.map((item) => `<a class="toc-l${item.level}" href="#${item.id}">${item.text}</a>`).join("")}</div>`
    : "";
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <script type="module">
    import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
    mermaid.initialize({
      startOnLoad: true,
      theme: "base",
      securityLevel: "loose",
      flowchart: { curve: "basis", nodeSpacing: 42, rankSpacing: 52 },
      themeVariables: {
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        primaryColor: "#eef6ff",
        primaryTextColor: "#12314d",
        primaryBorderColor: "#79a9da",
        lineColor: "#6d8298",
        secondaryColor: "#f5f7fb",
        tertiaryColor: "#fff7ed",
        edgeLabelBackground: "#ffffff",
        textColor: "#23384d"
      }
    });
  </script>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="shell">
    <aside class="side">
      <a class="brand" href="index.html">
        <div class="brand-mark">A</div>
        <div><strong>工程文档 Agent</strong><span>设计文档库</span></div>
      </a>
      <nav class="doc-nav">${navHtml(activeOut)}</nav>
      ${tocHtml}
    </aside>
    <main class="content">
      <header class="hero">
        <div class="eyebrow">Design Docs</div>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(desc)}</p>
      </header>
      <article class="article">${body}</article>
    </main>
  </div>
</body>
</html>`;
}

function indexPage() {
  const cards = docs.map((doc) => `<a class="index-card" href="${doc.out}"><span>${doc.title}</span><p>${doc.desc}</p></a>`).join("");
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>工程文档 Agent 设计文档库</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main class="index-page">
    <section class="index-hero">
      <div class="eyebrow">Engineering Document Agent</div>
      <h1>工程文档 Agent 设计文档库</h1>
      <p>统一浏览产品方案、调研依据、业务流程、PPT 生成和产品资料问答等设计文档。</p>
    </section>
    <section class="index-grid">${cards}</section>
  </main>
</body>
</html>`;
}

const styles = `
:root {
  --bg: #f4f7fb;
  --panel: #ffffff;
  --ink: #172a3a;
  --muted: #65758a;
  --line: #dbe5ef;
  --blue: #1f6feb;
  --blue-2: #e8f2ff;
  --shadow: 0 18px 50px rgba(22, 43, 67, 0.10);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  color: var(--ink);
  background: linear-gradient(180deg, #f8fbff 0%, var(--bg) 52%, #eef3f8 100%);
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  line-height: 1.62;
}
a { color: var(--blue); }
.shell { display: grid; grid-template-columns: 310px minmax(0, 1fr); min-height: 100vh; }
.side {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: auto;
  padding: 24px 18px;
  background: rgba(255,255,255,.82);
  border-right: 1px solid var(--line);
  backdrop-filter: blur(18px);
}
.brand {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 22px;
  color: var(--ink);
  text-decoration: none;
}
.brand-mark {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  color: #fff;
  border-radius: 11px;
  background: linear-gradient(135deg, #1f6feb, #0f8ca8);
  font-weight: 800;
}
.brand span { display: block; color: var(--muted); font-size: 12px; }
.doc-nav { display: grid; gap: 8px; }
.doc-link {
  display: block;
  padding: 12px;
  color: var(--ink);
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: 12px;
}
.doc-link:hover, .doc-link.active {
  background: var(--blue-2);
  border-color: #cfe4ff;
}
.doc-link span { display: block; font-size: 14px; font-weight: 750; }
.doc-link small { display: block; margin-top: 3px; color: var(--muted); font-size: 12px; line-height: 1.35; }
.toc-card {
  margin-top: 22px;
  padding: 14px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 14px;
}
.toc-title { margin-bottom: 8px; font-size: 13px; font-weight: 800; }
.toc-card a {
  display: block;
  padding: 5px 0;
  color: #334b63;
  text-decoration: none;
  font-size: 12px;
}
.toc-card a:hover { color: var(--blue); }
.toc-l2 { padding-left: 10px !important; }
.toc-l3 { padding-left: 22px !important; color: var(--muted) !important; }
.content { min-width: 0; padding: 36px clamp(22px, 4vw, 58px) 64px; }
.hero {
  margin-bottom: 22px;
  padding: 32px;
  border: 1px solid rgba(121,169,218,.35);
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(255,255,255,.96), rgba(232,242,255,.84));
  box-shadow: var(--shadow);
}
.eyebrow {
  display: inline-flex;
  margin-bottom: 14px;
  padding: 6px 10px;
  color: #164f90;
  background: #e8f2ff;
  border: 1px solid #cfe4ff;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
}
h1 { margin: 0 0 10px; font-size: clamp(30px, 4vw, 46px); line-height: 1.12; letter-spacing: 0; }
.hero p { max-width: 920px; margin: 0; color: var(--muted); font-size: 16px; }
.article {
  padding: 28px;
  background: rgba(255,255,255,.94);
  border: 1px solid var(--line);
  border-radius: 20px;
  box-shadow: 0 16px 44px rgba(22,43,67,.07);
}
.article h1 { padding-bottom: 14px; border-bottom: 1px solid var(--line); font-size: 34px; }
.article h2 {
  margin-top: 34px;
  padding-top: 22px;
  border-top: 1px solid var(--line);
  font-size: 25px;
}
.article h3 { margin-top: 26px; font-size: 19px; }
.article p, .article li { color: #31465b; }
.article code {
  padding: 2px 5px;
  border-radius: 6px;
  background: #eef4fb;
  color: #12314d;
}
.code {
  overflow: auto;
  padding: 16px;
  border: 1px solid #dbe5ef;
  border-radius: 12px;
  background: #0f172a;
  color: #e2e8f0;
}
.table-wrap {
  width: 100%;
  overflow: auto;
  margin: 16px 0;
  border: 1px solid var(--line);
  border-radius: 14px;
}
table { width: 100%; border-collapse: collapse; min-width: 680px; background: #fff; }
th, td { padding: 11px 12px; border-bottom: 1px solid #e5edf5; text-align: left; vertical-align: top; }
th { background: #f2f7fc; color: #18324c; font-weight: 800; }
tr:last-child td { border-bottom: 0; }
.diagram-wrap {
  overflow: auto;
  margin: 18px 0;
  padding: 18px;
  border: 1px solid #e1e9f2;
  border-radius: 14px;
  background: linear-gradient(180deg, #fff, #fbfdff);
}
.mermaid { min-width: 760px; margin: 0 auto; }
.architecture-map {
  display: grid;
  gap: 10px;
  margin: 18px 0;
  padding: 16px;
  border: 1px solid #dbe5ef;
  border-radius: 16px;
  background: #fbfdff;
}
.arch-row {
  display: grid;
  grid-template-columns: 128px minmax(0, 1fr);
  gap: 12px;
  align-items: stretch;
}
.arch-label {
  display: grid;
  place-items: center;
  min-height: 52px;
  padding: 10px;
  color: #12314d;
  font-weight: 850;
  border: 1px solid #cbd9e6;
  border-radius: 10px;
  background: #eef6ff;
}
.arch-modules {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  align-items: center;
  min-height: 52px;
  padding: 10px;
  border: 1px solid #dbe5ef;
  border-radius: 10px;
  background: #ffffff;
}
.arch-modules span {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 7px 12px;
  color: #20384f;
  font-weight: 700;
  border: 1px solid #d6e2ee;
  border-radius: 8px;
  background: #f7fafc;
}
.three-panel {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin: 18px 0;
}
.panel-col {
  min-width: 0;
  border: 1px solid #dbe5ef;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 8px 22px rgba(22,43,67,.05);
}
.panel-col h4 {
  margin: 0;
  padding: 13px 14px;
  color: #12314d;
  font-size: 15px;
  border-bottom: 1px solid #e5edf5;
  background: #eef6ff;
  border-radius: 14px 14px 0 0;
}
.panel-col ul {
  margin: 0;
  padding: 12px 16px 16px 30px;
}
.panel-col li { margin: 5px 0; }
.value-chain {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
  margin: 18px 0;
}
.chain-step {
  position: relative;
  min-height: 128px;
  padding: 15px 12px;
  text-align: center;
  border: 1px solid #cfe0f2;
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff, #f4f9ff);
}
.chain-step:not(:last-child)::after {
  content: "→";
  position: absolute;
  top: 48%;
  right: -12px;
  z-index: 2;
  color: #1f6feb;
  font-weight: 900;
}
.chain-num {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  margin: 0 auto 9px;
  color: #fff;
  border-radius: 999px;
  background: #1f6feb;
  font-size: 13px;
  font-weight: 850;
}
.chain-step h4 {
  margin: 0 0 7px;
  color: #12314d;
  font-size: 15px;
}
.chain-step p {
  margin: 0;
  color: #53677d;
  font-size: 13px;
  line-height: 1.4;
}
.chain-step strong {
  display: inline-flex;
  margin-top: 10px;
  padding: 5px 8px;
  color: #164f90;
  border: 1px solid #cfe4ff;
  border-radius: 999px;
  background: #e8f2ff;
  font-size: 12px;
}
.highlight-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin: 18px 0;
}
.highlight-card {
  padding: 15px;
  border: 1px solid #dbe5ef;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 8px 22px rgba(22,43,67,.05);
}
.highlight-card h4 {
  margin: 0 0 8px;
  color: #12314d;
  font-size: 15px;
}
.highlight-card p {
  margin: 0;
  color: #53677d;
  font-size: 13px;
  line-height: 1.45;
}
.index-page { padding: clamp(28px, 6vw, 72px); }
.index-hero {
  max-width: 980px;
  margin: 0 auto 28px;
  padding: 40px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(255,255,255,.96), rgba(232,242,255,.86));
  border: 1px solid rgba(121,169,218,.35);
  box-shadow: var(--shadow);
}
.index-hero h1 { max-width: 860px; }
.index-hero p { max-width: 760px; margin: 0; color: var(--muted); font-size: 17px; }
.index-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  max-width: 980px;
  margin: 0 auto;
}
.index-card {
  min-height: 142px;
  padding: 22px;
  color: var(--ink);
  text-decoration: none;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: rgba(255,255,255,.94);
  box-shadow: 0 12px 34px rgba(22,43,67,.07);
}
.index-card:hover {
  border-color: #9fc8f5;
  transform: translateY(-1px);
}
.index-card span { display: block; margin-bottom: 8px; font-size: 20px; font-weight: 850; }
.index-card p { margin: 0; color: var(--muted); }
@media (max-width: 1080px) {
  .shell { grid-template-columns: 1fr; }
  .side { position: relative; height: auto; }
  .index-grid { grid-template-columns: 1fr; }
  .three-panel { grid-template-columns: 1fr; }
  .arch-row { grid-template-columns: 1fr; }
  .value-chain, .highlight-grid { grid-template-columns: 1fr; }
  .chain-step:not(:last-child)::after { display: none; }
}
@media (max-width: 720px) {
  .content, .index-page { padding: 18px 14px 42px; }
  .hero, .article, .index-hero { padding: 20px; }
}
@media print {
  .side { display: none; }
  .shell { display: block; }
  .content { padding: 0; }
  .hero, .article { box-shadow: none; }
}
`;

fs.writeFileSync(path.join(outDir, "styles.css"), styles);
fs.writeFileSync(path.join(outDir, "index.html"), indexPage());

for (const doc of docs) {
  const markdown = fs.readFileSync(path.join(root, doc.file), "utf8");
  const rendered = renderMarkdown(markdown);
  fs.writeFileSync(path.join(outDir, doc.out), layout({
    title: doc.title,
    desc: doc.desc,
    body: rendered.html,
    toc: rendered.toc,
    activeOut: doc.out
  }));
}

console.log(`Generated ${docs.length + 1} HTML files in ${outDir}`);
