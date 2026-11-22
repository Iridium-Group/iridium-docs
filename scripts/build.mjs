// Build the docs site: content/*.md -> dist/*.html. Usage: node scripts/build.mjs
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
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
@font-face{font-family:Inter;font-weight:100 900;font-display:swap;src:url(fonts/inter-latin-wght-normal.woff2) format("woff2")}
@font-face{font-family:"IBM Plex Mono";font-weight:400;font-display:swap;src:url(fonts/ibm-plex-mono-latin-400-normal.woff2) format("woff2")}
@font-face{font-family:"IBM Plex Mono";font-weight:500;font-display:swap;src:url(fonts/ibm-plex-mono-latin-500-normal.woff2) format("woff2")}
:root{color-scheme:light dark;--bg:#fafafa;--fg:#111;--mut:#5e5e5e;--line:#dcdcdc;--acc:#111;--signal:#111;--code:#efefef;--sans:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;--mono:"IBM Plex Mono",ui-monospace,"SF Mono",Menlo,Consolas,monospace}
@media(prefers-color-scheme:dark){:root{--bg:#141414;--fg:#fafafa;--mut:#a3a3a3;--line:#2e2e2e;--acc:#fafafa;--signal:#fafafa;--code:#1d1d1d}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.65 var(--sans);-webkit-font-smoothing:antialiased}
.wrap{display:grid;grid-template-columns:248px minmax(0,1fr);max-width:1120px;margin:0 auto}
nav{padding:28px 20px;border-right:1px solid var(--line);position:sticky;top:0;height:100vh;overflow:auto;font-size:14px}
nav .brand{font-weight:600;font-size:16px;letter-spacing:-.01em;display:block;margin-bottom:14px;color:var(--fg);text-decoration:none}
nav h2{font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:.04em;color:var(--mut);margin:22px 0 6px}
nav ul{list-style:none;margin:0;padding:0}
nav a{display:block;position:relative;padding:4px 0 4px 12px;color:var(--mut);text-decoration:none;border-radius:4px}
nav a:hover{color:var(--fg)}
nav a[aria-current]{color:var(--fg);font-weight:500}
nav a[aria-current]::before{content:"";position:absolute;left:0;top:7px;bottom:7px;width:2px;border-radius:2px;background:var(--signal)}
main{padding:36px 40px 80px;min-width:0;max-width:820px}
a{color:var(--acc);text-decoration-thickness:1px;text-underline-offset:3px;text-decoration-color:color-mix(in srgb,var(--acc) 45%,transparent)}
a:hover{text-decoration-color:currentColor}
:focus-visible{outline:2px solid var(--acc);outline-offset:2px;border-radius:3px}
h1,h2,h3{font-weight:600;color:var(--fg)}
h1{margin:0 0 .6em;font-size:30px;line-height:1.2;letter-spacing:-.02em}
h2{margin-top:2.2em;font-size:20px;line-height:1.3;letter-spacing:-.01em;padding-bottom:.35em;border-bottom:1px solid var(--line)}
h3{margin-top:1.8em;font-size:16px}
p,li{max-width:70ch}
code{font-family:var(--mono);background:var(--code);padding:.12em .36em;border-radius:4px;font-size:.86em}
pre{font-family:var(--mono);background:var(--code);border:1px solid var(--line);padding:14px 16px;border-radius:6px;overflow:auto;font-size:13px;line-height:1.6}
pre code{padding:0;background:none;font-size:inherit}
table{border-collapse:collapse;display:block;overflow:auto;font-size:14px}
td,th{border:0;border-bottom:1px solid var(--line);padding:8px 14px 8px 0;text-align:left;vertical-align:top}
th{font-size:12px;font-weight:500;letter-spacing:.02em;color:var(--mut);border-bottom-color:var(--mut)}
td code{white-space:nowrap}
hr{border:0;border-top:1px solid var(--line)}
blockquote{margin:1.2em 0;padding:.1em 0 .1em 16px;border-left:2px solid var(--line);color:var(--mut)}
@media(max-width:720px){.wrap{display:block}nav{position:static;height:auto;border:0;border-bottom:1px solid var(--line)}main{padding:20px 16px 56px}h1{font-size:26px}}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}
</style></head><body><div class="wrap"><nav><a class="brand" href="./">Iridium</a>${nav}</nav><main>${body}</main></div></body></html>
`;
}

export async function build(src = 'content', out = 'dist') {
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  // Typefaces are served from the site itself (Inter and IBM Plex Mono, SIL OFL 1.1).
  await cp(fileURLToPath(new URL('../assets/fonts', import.meta.url)), join(out, 'fonts'), {
    recursive: true,
  });
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
