import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const notes = JSON.parse(readFileSync(join(root, 'content/agent-notes.json'), 'utf8'));
const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const url = (note) => `/notes/${note.id}/`;
const categories = ['全部', ...new Set(notes.map((note) => note.category))];
const sharedHead = (title, description, canonical, type = 'website') => `
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f4f4f1">
  <meta name="description" content="${esc(description)}">
  <meta property="og:type" content="${type}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(canonical)}">
  <link rel="canonical" href="${esc(canonical)}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/css/site.css">
  <title>${esc(title)}</title>`;
const header = (isArticle = false) => `<a class="skip-link" href="#main">跳到正文</a>
  <header class="site-header shell">
    <a class="brand" href="/" aria-label="Dream 首页"><span class="brand-mark">D<span>.</span></span><span class="brand-name">DREAM / 77CJJ</span></a>
    <nav class="site-nav" aria-label="主导航"><a href="${isArticle ? '/#notes' : '#notes'}">札记</a><a href="${isArticle ? '/#projects' : '#projects'}">项目</a><a href="${isArticle ? '/#about' : '#about'}">关于</a></nav>
    <a class="header-social" href="https://github.com/77cjj" target="_blank" rel="noopener noreferrer">GITHUB <span aria-hidden="true">↗</span></a>
  </header>`;
const footer = `<footer class="site-footer shell"><span>© 2026 DREAM / 77CJJ</span><span>持续构建，持续求证。</span><a href="#main">返回顶部 ↑</a></footer>`;
const cards = notes.map((note, index) => `<a class="note-card" href="${url(note)}" data-category="${esc(note.category)}">
        <span class="note-no">${String(index + 1).padStart(2, '0')}</span><span class="note-content"><span class="note-category">${esc(note.category)} <span class="note-sep">/</span> 来源解读</span><strong>${esc(note.title)}</strong><span class="note-dek">${esc(note.dek)}</span></span><span class="note-arrow" aria-hidden="true">↗</span>
      </a>`).join('\n');
const homepage = `<!doctype html><html lang="zh-CN"><head>${sharedHead('Dream — AI Agent 应用开发与产品实践', 'Dream 的个人博客：14 篇有出处的 AI Agent 开发札记、产品实践与项目。', 'https://77cjj.github.io/')}</head><body>
  ${header()}
  <main id="main">
    <section class="hero shell" aria-labelledby="hero-title"><div class="hero-copy"><p class="overline"><span class="live-dot"></span> 独立开发者 / AI AGENT 应用开发</p><h1 id="hero-title">让 Agent<br><span>真正做事</span><i>.</i></h1><p class="hero-description">我关注模型如何连接工具、检索与真实世界。这里记录架构选择、失败路径和产品实践；不止展示一个能跑的 Demo。</p><div class="hero-actions"><a class="button button-dark" href="#notes">阅读开发札记 <span aria-hidden="true">↘</span></a><a class="button button-plain" href="#projects">查看项目 ↗</a></div><p class="hero-caption">BUILD / OBSERVE / REFINE <span>— 2026</span></p></div><div class="hero-visual"><canvas id="signal-field" aria-label="动态点阵：围绕焦点变化的 Agent 信号场" role="img"></canvas><div class="visual-top"><span>FIELD / 001</span><span class="visual-pulse"><b></b> SIGNAL ACTIVE</span></div><div class="visual-center"><span class="visual-cross">+</span><span class="visual-ring"></span></div><div class="visual-bottom"><span>输入 → 工具 → 反馈</span><span>MOVE TO EXPLORE</span></div></div></section>
    <div class="index-strip shell"><span><b>14</b> 篇来源解读</span><span><b>04</b> 个主题路径</span><span><b>04</b> 家一手机构</span><span class="strip-end">READ / VERIFY / BUILD ↗</span></div>
    <section class="notes-section shell" id="notes" aria-labelledby="notes-title"><div class="section-intro"><div><p class="eyebrow">01 / FIELD NOTES</p><h2 id="notes-title">阅读与实践<span class="period">.</span></h2></div><p>选自官方工程博客与文档。以下是原创中文解读，不是翻译或转载；每篇都附原文、我的理解和一个可实践的切口。</p></div>
      <div class="feature-note"><div><span class="feature-label">START HERE · 专题导读</span><h3>从能运行的 Demo，<br>到可靠的 AI Agent 应用</h3><p>模型能调用工具只是起点；真正的工程工作发生在证据、失败与人类接手的边界。</p><a href="/notes/reliable-agent-apps/">阅读导读 <span aria-hidden="true">↗</span></a></div><div class="feature-art" aria-hidden="true"><span>01</span><span>AGENT / SYSTEM</span></div></div>
      <div class="notes-toolbar"><span>INDEX / 01—14</span><div class="filters" role="group" aria-label="按主题筛选">${categories.map((category, index) => `<button type="button" data-filter="${esc(category)}" aria-pressed="${index === 0}">${esc(category)}</button>`).join('')}</div></div><div class="notes-grid" id="notes-grid">${cards}</div><p class="empty-message" hidden>这个主题暂时没有札记。</p><p class="source-policy">来源说明：仅归纳原文可核对的观点；“我的理解”与“可做的尝试”是本站的推论，不代表原作者结论。产品与 API 细节以链接中的最新官方资料为准。</p>
    </section>
    <section class="projects-section" id="projects" aria-labelledby="projects-title"><div class="shell"><div class="section-intro"><div><p class="eyebrow">02 / SELECTED WORK</p><h2 id="projects-title">正在构建<span class="period">.</span></h2></div><p>把研究放回真实产品：内容、工具、交互与验证一起完成。</p></div><div class="project-grid"><a class="project-tile" href="https://ustip.me" target="_blank" rel="noopener noreferrer"><span class="project-top">01 / WEB PRODUCT <span>↗</span></span><strong>ustip.me</strong><p>面向 Summer Work Travel 参与者的岗位信息、指南与 AI 辅助规划。</p><span class="project-foot">全栈产品 · AI 应用</span></a><a class="project-tile" href="https://quantlab-research-os.cjj1149044114.chatgpt.site" target="_blank" rel="noopener noreferrer"><span class="project-top">02 / RESEARCH TOOL <span>↗</span></span><strong>QuantLab</strong><p>本地优先的量化研究与回测工作台。预览访问受限，仅用于研究，非实盘交易。</p><span class="project-foot">市场数据 · 回测验证</span></a></div></div></section>
    <section class="about-section shell" id="about" aria-labelledby="about-title"><p class="eyebrow">03 / ABOUT</p><div><h2 id="about-title">你好，我是 Dream。</h2><p>我喜欢把好奇心变成可以使用、可以验证的东西。现在主要探索 Agent 工具调用、RAG 检索质量，以及从界面到部署的完整产品链路。这个博客会持续记录做法，也会保留尚未解决的问题。</p><div class="about-links"><a href="https://github.com/77cjj" target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href="mailto:cjj1149044114@gmail.com">Email ↗</a></div></div></section>
  </main>${footer}<script src="/js/site.js" defer></script></body></html>`;
writeFileSync(join(root, 'index.html'), homepage);

for (const [index, note] of notes.entries()) {
  const next = notes[(index + 1) % notes.length];
  const page = `<!doctype html><html lang="zh-CN"><head>${sharedHead(`${note.title} — Dream`, note.dek, `https://77cjj.github.io${url(note)}`, 'article')}</head><body>${header(true)}<main id="main"><div class="article-top shell"><a href="/#notes">← 返回札记索引</a><span>READING NOTE / ${String(index + 1).padStart(2, '0')} OF ${notes.length}</span></div><article class="article-shell shell"><header class="article-hero"><p class="eyebrow">${esc(note.category)} / 原文解读</p><h1>${esc(note.title)}<span class="period">.</span></h1><p class="article-dek">${esc(note.dek)}</p><div class="article-byline"><span>Dream · 2026.09</span><span>短篇阅读札记</span></div></header><div class="article-columns"><aside class="article-aside"><span>参考原文</span><a href="${esc(note.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(note.source)} ↗</a><small>以下是独立中文札记，并非原文翻译。来源观点与个人推论分开展示。</small></aside><div class="article-body"><h2>问题从哪里来</h2><p>${esc(note.lead)}</p><h2>原文给出的线索</h2><ol>${note.points.map((point) => `<li>${esc(point)}</li>`).join('')}</ol><h2>我的理解 · 可以怎么试</h2><p>${esc(note.takeaway)}</p><div class="source-box"><span>PRIMARY SOURCE / 原文</span><a href="${esc(note.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(note.source)} <span aria-hidden="true">↗</span></a><p>请回到原文核对上下文；技术接口、价格和能力可能随时间变化。</p></div></div></div></article><div class="article-next shell"><span>NEXT NOTE / ${String((index + 1) % notes.length + 1).padStart(2, '0')}</span><a href="${url(next)}">${esc(next.title)} <span aria-hidden="true">↗</span></a></div></main>${footer}</body></html>`;
  const dir = join(root, 'notes', note.id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), page);
}
console.log(`Built homepage and ${notes.length} source-linked notes.`);
