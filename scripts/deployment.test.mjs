import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { deploymentConfig } from './deployment-config.mjs';
import { verifyDist } from './verify-dist.mjs';

test('Pages configuration handles project repositories, user sites, and local development', () => {
  assert.deepEqual(deploymentConfig({}), { site: undefined, base: '/' });
  assert.deepEqual(deploymentConfig({ GITHUB_ACTIONS: 'true', GITHUB_REPOSITORY: 'avsssai/project-darbar' }), { site: 'https://avsssai.github.io', base: '/project-darbar/' });
  assert.deepEqual(deploymentConfig({ GITHUB_ACTIONS: 'true', GITHUB_REPOSITORY: 'avsssai/avsssai.github.io' }), { site: 'https://avsssai.github.io', base: '/' });
  assert.deepEqual(deploymentConfig({ ASTRO_SITE: 'https://example.com', ASTRO_BASE: '/' }), { site: 'https://example.com', base: '/' });
  assert.equal(deploymentConfig({ ASTRO_BASE: '/preview' }).base, '/preview/');
});
test('published asset check validates CSS, images and inline SVG hrefs beneath a project base', async () => {
  const folder = await mkdtemp(path.join(tmpdir(), 'darbar-pages-'));
  try {
    await mkdir(path.join(folder, '_astro'));
    await mkdir(path.join(folder, 'images'));
    await mkdir(path.join(folder, 'fonts'));
    await writeFile(path.join(folder, 'images/mark.svg'), '<svg/>');
    await writeFile(path.join(folder, 'fonts/font.woff2'), 'font');
    await writeFile(path.join(folder, '_astro/site.css'), '@font-face {src:url(/project-darbar/fonts/font.woff2)}');
    await writeFile(path.join(folder, 'index.html'), '<link href="/project-darbar/_astro/site.css"><img src="/project-darbar/images/mark.svg"><svg><image href="/project-darbar/images/mark.svg"/><use href="#clip"/></svg><a href="https://youtube.com">YouTube</a>');
    assert.equal(await verifyDist(folder, '/project-darbar/'), 4);
    await writeFile(path.join(folder, 'index.html'), '<img src="/images/mark.svg">');
    await assert.rejects(verifyDist(folder, '/project-darbar/'), /escapes Pages base/);
    await writeFile(path.join(folder, 'index.html'), '<img src="/project-darbar/images/missing.svg">');
    await assert.rejects(verifyDist(folder, '/project-darbar/'), /missing asset/);
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
});
