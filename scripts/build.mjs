// Build the docs site: content/*.md -> dist/*.html. Usage: node scripts/build.mjs
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Marked } from 'marked';

export const NAV = [
  {
    group: 'Start',
    pages: [
      ['index', 'Overview'],
      ['getting-started', 'Getting started'],
    ],
  },
  {
    group: 'Guides',
    pages: [
      ['proxy', 'Proxy'],
      ['inspector', 'Inspector'],
    ],
  },
  {
    group: 'Reference',
    pages: [
      ['config-reference', 'Configuration'],
      ['config-api', 'Config API'],
      ['transport-api', 'Transport API'],
      ['transport-architecture', 'Transport architecture'],
      ['utils-api', 'Utils API'],
    ],
  },
];

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const slug = (s) =>
  s
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

export function render(markdown) {
  const marked = new Marked({ gfm: true });
  marked.use({
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        return `<h${depth} id="${slug(text)}">${text}</h${depth}>\n`;
      },
      html: ({ text }) => esc(text), // never pass raw HTML from content through
    },
  });
  return marked.parse(markdown);
}

function page(title, body, current) {
  const nav = NAV.map(
    (g) =>
      `<h2>${esc(g.group)}</h2><ul>${g.pages
        .map(
          ([id, t]) =>
            `<li><a href="${id === 'index' ? './' : `${id}.html`}"${id === current ? ' aria-current="page"' : ''}>${esc(t)}</a></li>`,
        )
        .join('')}</ul>`,
  ).join('');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} · Iridium docs</title>
<style>
:root{--bg:#fff;--fg:#1a1d23;--mut:#5b6472;--line:#e3e6eb;--acc:#4f46e5;--code:#f5f6f8}
@media(prefers-color-scheme:dark){:root{--bg:#0f1115;--fg:#e6e8ec;--mut:#9aa3b2;--line:#252a33;--acc:#8b93ff;--code:#171a21}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 system-ui,sans-serif}
.wrap{display:grid;grid-template-columns:230px minmax(0,1fr);max-width:1100px;margin:0 auto}
nav{padding:24px 16px;border-right:1px solid var(--line);position:sticky;top:0;height:100vh;overflow:auto}
nav .brand{font-weight:700;font-size:18px;display:block;margin-bottom:12px;color:var(--fg);text-decoration:none}
nav h2{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--mut);margin:18px 0 4px}
nav ul{list-style:none;margin:0;padding:0}nav a{display:block;padding:3px 0;color:var(--fg);text-decoration:none}
nav a[aria-current]{color:var(--acc);font-weight:600}main{padding:24px 32px 64px;min-width:0}
a{color:var(--acc)}h1{margin-top:0}h2,h3{margin-top:2em}
code{background:var(--code);padding:.1em .3em;border-radius:4px;font-size:.9em}
pre{background:var(--code);padding:14px;border-radius:8px;overflow:auto}pre code{padding:0;background:none}
table{border-collapse:collapse;display:block;overflow:auto}td,th{border:1px solid var(--line);padding:6px 10px;text-align:left}
@media(max-width:720px){.wrap{display:block}nav{position:static;height:auto;border:0;border-bottom:1px solid var(--line)}main{padding:16px}}
</style></head><body><div class="wrap"><nav><a class="brand" href="./">Iridium</a>${nav}</nav><main>${body}</main></div></body></html>
`;
}

export async function build(src = 'content', out = 'dist') {
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  const ids = NAV.flatMap((g) => g.pages.map(([id]) => id));
  for (const id of ids) {
    const md = await readFile(join(src, `${id}.md`), 'utf8');
    const title = /^#\s+(.+)$/m.exec(md)?.[1] ?? id;
    // Links between pages are written as page.html; the index is also reachable as ./
    await writeFile(
      join(out, `${id === 'index' ? 'index' : id}.html`),
      page(title, render(md), id),
    );
  }
  return ids;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const ids = await build();
  console.log(`built ${ids.length} pages into dist/`);
}
