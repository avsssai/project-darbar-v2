import assert from 'node:assert/strict';
import test from 'node:test';
import { assetPath } from '../src/lib/asset-path.ts';

test('public assets resolve under a GitHub Pages project prefix', () => {
  for (const base of ['/project-darbar', '/project-darbar/']) {
    assert.equal(assetPath('/images/band-cutout-v2.png', base), '/project-darbar/images/band-cutout-v2.png');
    assert.equal(assetPath('/fonts/italiana-latin-400.woff2', base), '/project-darbar/fonts/italiana-latin-400.woff2');
    assert.equal(assetPath('/favicon.svg', base), '/project-darbar/favicon.svg');
  }
});
test('root hosting retains its asset paths', () => {
  assert.equal(assetPath('/images/music/5FVp1YWyd28.avif', '/'), '/images/music/5FVp1YWyd28.avif');
});
test('external thumbnails, protocol URLs and SVG fragment references stay intact', () => {
  for (const path of ['https://i.ytimg.com/vi/example/hqdefault.jpg', '//cdn.example.com/image.png', '#artist-cutout-1', 'data:image/png;base64,abc', 'relative/image.png', '']) {
    assert.equal(assetPath(path, '/project-darbar/'), path);
  }
});
