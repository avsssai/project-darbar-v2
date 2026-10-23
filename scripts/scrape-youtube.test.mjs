import assert from 'node:assert/strict';
import test from 'node:test';
import { extractVideos } from './scrape-youtube.mjs';

test('extracts and deduplicates real result structure while identifying the band uploader', () => {
  const videoRenderer = { videoId: 'fixture0001', title: { runs: [{ text: 'A cover with }; and "quotes"' }] }, ownerText: { runs: [{ text: 'The Project DARBAR', navigationEndpoint: { browseEndpoint: { canonicalBaseUrl: '/@fixture-band' } } }] } };
  const other = { videoRenderer: { videoId: 'fixture0002', title: { simpleText: 'Another artist' }, ownerText: { simpleText: 'Other uploader' } } };
  const html = `<script>var ytInitialData = ${JSON.stringify({ contents: [{ videoRenderer }, { videoRenderer }, other] })};</script><script>unrelated()</script>`;
  const videos = extractVideos(html);
  assert.equal(videos.length, 2);
  assert.equal(videos[0].title, 'A cover with }; and "quotes"');
  assert.equal(videos[0].url, 'https://www.youtube.com/watch?v=fixture0001');
  assert.equal(videos[0].channelURL, 'https://www.youtube.com/@fixture-band');
  assert.equal(videos[0].matchesBand, true);
  assert.equal(videos[1].matchesBand, false);
});

test('rejects a blocked response rather than inventing video URLs', () => {
  assert.throws(() => extractVideos('<html>Before you continue to YouTube</html>'), /No YouTube result data/);
});
