import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const notes = JSON.parse(readFileSync(join(root, 'content/agent-notes.json'), 'utf8'));
const read = (relative) => readFileSync(join(root, relative), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const ids = new Set();

assert(notes.length >= 12, 'Expected at least twelve reading notes');
for (const note of notes) {
  assert(/^[a-z0-9-]+$/.test(note.id) && !ids.has(note.id), `Invalid or duplicate id: ${note.id}`);
  ids.add(note.id);
  assert(note.title && note.category && note.dek && note.lead && note.takeaway, `Missing content: ${note.id}`);
  assert(Array.isArray(note.points) && note.points.length >= 3, `Too few source points: ${note.id}`);
  assert(note.sourceUrl.startsWith('https://'), `Missing HTTPS source: ${note.id}`);
  const page = read(`notes/${note.id}/index.html`);
  assert(page.includes(note.sourceUrl) && page.includes(note.title), `Generated page mismatch: ${note.id}`);
}
const homepage = read('index.html');
assert((homepage.match(/class="note-card"/g) || []).length === notes.length, 'Homepage note count mismatch');
assert(homepage.includes('/js/site.js') && homepage.includes('signal-field'), 'Missing visual interaction');
console.log(`Validated ${notes.length} unique, source-linked article pages and homepage index.`);
