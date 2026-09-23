(() => {
  const key = 'dream-blog-editor-v1';
  const fields = {
    title: document.getElementById('draft-title'),
    slug: document.getElementById('draft-slug'),
    category: document.getElementById('draft-category'),
    summary: document.getElementById('draft-summary'),
    body: document.getElementById('draft-body')
  };
  const preview = {
    category: document.getElementById('preview-category'),
    title: document.getElementById('preview-heading'),
    summary: document.getElementById('preview-summary'),
    path: document.getElementById('preview-path'),
    body: document.getElementById('preview-body'),
    words: document.getElementById('word-count'),
    status: document.getElementById('save-status')
  };
  let saveTimer = 0;

  const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const cleanSlug = (value) => value.toLowerCase().trim().replace(/[^a-z0-9\u4e00-\u9fff-]+/g, '-').replace(/^-+|-+$/g, '') || 'untitled';
  const state = () => Object.fromEntries(Object.entries(fields).map(([name, element]) => [name, element.value]));

  function inline(text) {
    return escapeHtml(text)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1 ↗</a>');
  }

  function markdown(value) {
    const lines = value.replace(/\r/g, '').split('\n');
    let output = '';
    let inList = false;
    let inQuote = false;
    const closeBlocks = () => { if (inList) { output += '</ul>'; inList = false; } if (inQuote) { output += '</blockquote>'; inQuote = false; } };
    for (const line of lines) {
      if (/^###\s+/.test(line)) { closeBlocks(); output += `<h3>${inline(line.replace(/^###\s+/, ''))}</h3>`; }
      else if (/^##\s+/.test(line)) { closeBlocks(); output += `<h2>${inline(line.replace(/^##\s+/, ''))}</h2>`; }
      else if (/^#\s+/.test(line)) { closeBlocks(); output += `<h2>${inline(line.replace(/^#\s+/, ''))}</h2>`; }
      else if (/^[-*]\s+/.test(line)) { if (inQuote) { output += '</blockquote>'; inQuote = false; } if (!inList) { output += '<ul>'; inList = true; } output += `<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`; }
      else if (/^>\s?/.test(line)) { if (inList) { output += '</ul>'; inList = false; } if (!inQuote) { output += '<blockquote>'; inQuote = true; } output += `<p>${inline(line.replace(/^>\s?/, ''))}</p>`; }
      else if (!line.trim()) { closeBlocks(); }
      else { closeBlocks(); output += `<p>${inline(line)}</p>`; }
    }
    closeBlocks();
    return output || '<p>开始输入正文后，这里会实时预览。</p>';
  }

  function toMarkdown(draft) {
    const date = new Date().toISOString().slice(0, 10);
    return `---\ntitle: "${draft.title.replace(/"/g, '\\"')}"\nslug: "${cleanSlug(draft.slug)}"\ncategory: "${draft.category.replace(/"/g, '\\"')}"\ndate: "${date}"\nsummary: "${draft.summary.replace(/"/g, '\\"').replace(/\n/g, ' ')}"\ndraft: true\n---\n\n${draft.body.trim()}\n`;
  }

  function render() {
    const draft = state();
    const slug = cleanSlug(draft.slug);
    preview.category.textContent = `${draft.category.trim() || '未分类'} / 草稿`;
    preview.title.textContent = draft.title.trim() || '无标题草稿';
    preview.summary.textContent = draft.summary.trim() || '摘要会显示在这里。';
    preview.path.textContent = `/notes/${slug}/`;
    preview.body.innerHTML = markdown(draft.body);
    const count = draft.body.replace(/\s/g, '').length;
    preview.words.textContent = `${count} 字`;
    preview.status.textContent = '正在保存…';
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      localStorage.setItem(key, JSON.stringify({ ...draft, updatedAt: new Date().toISOString() }));
      preview.status.textContent = '已保存到此浏览器';
    }, 250);
  }

  function load() {
    try {
      const draft = JSON.parse(localStorage.getItem(key) || '{}');
      for (const [name, element] of Object.entries(fields)) if (typeof draft[name] === 'string') element.value = draft[name];
    } catch { localStorage.removeItem(key); }
    render();
  }

  for (const element of Object.values(fields)) element.addEventListener('input', render);
  fields.title.addEventListener('blur', () => { if (!fields.slug.value.trim()) { fields.slug.value = cleanSlug(fields.title.value); render(); } });
  document.getElementById('export-button').addEventListener('click', () => {
    const draft = state();
    const blob = new Blob([toMarkdown(draft)], { type: 'text/markdown;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob); link.download = `${cleanSlug(draft.slug)}.md`; link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  });
  document.getElementById('copy-button').addEventListener('click', async () => {
    await navigator.clipboard.writeText(toMarkdown(state()));
    preview.status.textContent = 'Markdown 已复制';
  });
  document.getElementById('clear-button').addEventListener('click', () => {
    if (!window.confirm('清空当前浏览器中的草稿并新建空白文章？请先导出需要保留的内容。')) return;
    for (const element of Object.values(fields)) element.value = '';
    localStorage.removeItem(key); render(); fields.title.focus();
  });
  document.getElementById('import-file').addEventListener('change', async (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    const text = await file.text();
    const match = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (match) {
      const meta = Object.fromEntries(match[1].split('\n').map((line) => { const split = line.indexOf(':'); return split > -1 ? [line.slice(0, split).trim(), line.slice(split + 1).trim().replace(/^"|"$/g, '')] : ['', '']; }));
      fields.title.value = meta.title || ''; fields.slug.value = meta.slug || ''; fields.category.value = meta.category || ''; fields.summary.value = meta.summary || ''; fields.body.value = match[2].trim();
    } else { fields.body.value = text; }
    event.target.value = ''; render();
  });
  load();
})();
