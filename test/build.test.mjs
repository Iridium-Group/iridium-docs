import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { NAV, build, render, slug } from '../scripts/build.mjs';

describe('docs build', () => {
  it('builds every page in the nav', async () => {
    const out = await mkdtemp(join(tmpdir(), 'docs-'));
    const ids = await build('content', out);
    const files = await readdir(out);
    for (const id of ids) assert.ok(files.includes(`${id}.html`), id);
    assert.ok((await readdir(join(out, 'fonts'))).includes('inter-latin-wght-normal.woff2'));
    assert.equal(ids.length, NAV.flatMap((g) => g.pages).length);
  });
  it('has no broken links between pages', async () => {
    const out = await mkdtemp(join(tmpdir(), 'docs-'));
    await build('content', out);
    const files = new Set(await readdir(out));
    for (const f of [...files].filter((f) => f.endsWith('.html'))) {
      const html = await readFile(join(out, f), 'utf8');
      for (const [, href] of html.matchAll(/href="([^"#:]+\.html)(?:#[^"]*)?"/g)) {
        assert.ok(files.has(href), `${f} links to missing ${href}`);
      }
    }
  });
  it('adds heading ids and escapes raw HTML', () => {
    assert.match(render('## Hello World'), /id="hello-world"/);
    assert.ok(!render('<script>alert(1)</script>').includes('<script>'));
    assert.equal(slug('`a` b'), 'a-b');
  });
});
