import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { deploymentConfig } from './deployment-config.mjs';

/** Verify emitted HTML/CSS public URLs, including resources inside inline SVGs. */
export async function verifyDist(directory, base = '/') {
  const prefix = `${base.replace(/\/$/, '')}/`;
  let checked = 0;
  async function visit(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const file = path.join(folder, entry.name);
      if (entry.isDirectory()) { await visit(file); continue; }
      if (!/\.(html|css)$/.test(file)) continue;
      const text = await readFile(file, 'utf8');
      const references = [
        ...text.matchAll(/\b(?:src|href|poster)=["']([^"']+)["']/g),
        ...text.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g),
      ];
      const resourceURL = new URL(prefix + path.relative(directory, file).split(path.sep).join('/'), 'https://pages.example');
      for (const [, reference] of references) {
        if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(reference)) continue;
        const url = new URL(reference.replace(/&amp;/g, '&'), resourceURL);
        assert(url.pathname.startsWith(prefix), `${file}: ${reference} escapes Pages base ${prefix}`);
        const local = path.join(directory, decodeURIComponent(url.pathname.slice(prefix.length)));
        let info;
        try { info = await stat(local); } catch { assert.fail(`${file}: missing asset ${reference}`); }
        if (info.isDirectory()) await stat(path.join(local, 'index.html'));
        checked++;
      }
    }
  }
  await stat(path.join(directory, 'index.html'));
  await visit(directory);
  assert(checked > 0, 'Built site contains no local asset references');
  return checked;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const count = await verifyDist(path.resolve('dist'), deploymentConfig().base);
  console.log(`Verified ${count} built asset references.`);
}
