import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const home = read('index.html');
const editor = read('editor/index.html');
const editorScript = read('js/editor.js');

assert(home.includes('00</b> 篇公开文章'), 'Homepage must state that no posts are public');
assert(!home.includes('/notes/'), 'Homepage must not link to withdrawn notes');
assert(home.includes('/editor/'), 'Homepage must link to the browser editor');
assert(editor.includes('noindex,nofollow'), 'Editor must stay out of search indexes');
assert(editor.includes('草稿不会自动公开'), 'Editor must explain the publication boundary');
assert(editorScript.includes('localStorage.setItem'), 'Editor must autosave locally');
assert(editorScript.includes('text/markdown'), 'Editor must export Markdown');
assert(!existsSync(join(root, 'notes')), 'Withdrawn notes directory still exists');
assert(!existsSync(join(root, '2024')), 'Legacy placeholder posts still exist');

console.log('Validated article withdrawal and local-first browser editor.');
