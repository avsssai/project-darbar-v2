import assert from 'node:assert/strict';
import test from 'node:test';
import { artistInstruments, artistInstrumentAt, ensembleThreadAt, sequenceInstrumentSpans } from '../src/data/ensemble-thread.ts';
import { artists, site } from '../src/data/site.ts';
import { scrollStrokeDistance } from '../src/lib/rail-progress.ts';

const coordinates = (path) => path.match(/-?\d+(?:\.\d+)?/g).map(Number);

test('each musician has a distinct continuous instrument inside its reserved stage', () => {
  const distinct = new Set();
  for (const instrument of artistInstruments) {
    for (const stage of [
      { x: 0, y: 0, width: 120, height: 160 },
      { x: 1066, y: 1500, width: 120, height: 160 },
      { x: 122, y: 1900, width: 96, height: 128 },
    ]) {
      const path = artistInstrumentAt(instrument, stage);
      assert(!/[MZ]|NaN|Infinity/.test(path), 'No pen lifts, closing jumps, or invalid coordinates');
      assert(path.startsWith(`L${stage.x + stage.width} ${stage.y}`));
      assert(path.endsWith(`${stage.x + stage.width} ${stage.y + stage.height}`));
      const values = coordinates(path);
      assert.equal(values.length % 2, 0);
      for (let i = 0; i < values.length; i += 2) {
        assert(values[i] >= stage.x && values[i] <= stage.x + stage.width, `${instrument}: x stays inside stage`);
        assert(values[i + 1] >= stage.y && values[i + 1] <= stage.y + stage.height, `${instrument}: y stays inside stage`);
      }
      if (stage.x === 0) distinct.add(path);
    }
  }
  assert.equal(distinct.size, 4, 'Every instrument has its own drawing');
});

test('instrument connectors stay inside the stage and right gutter at desktop and mobile sizes', () => {
  for (const instrument of artistInstruments) {
    for (const [rail, stage, rowTop, rowBottom] of [
      [1359, { x: 1140, y: 1500, width: 120, height: 160 }, 1472, 1688],
      [348, { x: 127, y: 1600, width: 120, height: 160 }, 1540, 1930],
      [290, { x: 122, y: 1900, width: 120, height: 160 }, 1840, 2260],
    ]) {
      const path = ensembleThreadAt(instrument, rail, stage, rowTop, rowBottom);
      assert(path.startsWith(`L${rail} ${rowTop}`));
      assert(path.endsWith(`${rail} ${rowBottom}`));
      assert(!/[MZ]|NaN|Infinity/.test(path));
      const values = coordinates(path);
      for (let i = 0; i < values.length; i += 2) {
        assert(values[i] >= stage.x && values[i] <= rail, 'Never enters the portrait or text column');
        assert(values[i + 1] >= rowTop && values[i + 1] <= rowBottom, 'Never enters an adjacent row');
      }
    }
  }
});

test('the musician order retains the correct portrait, instrument, and name emphasis', () => {
  assert.deepEqual(artists.map(({ instrument, highlight, cutout }) => [instrument, highlight, cutout.viewBox]), [
    ['violin', 'Koundinya', '995 340 205 300'],
    ['keys', 'Manas', '558 375 250 265'],
    ['guitar', 'Mouli', '1175 385 195 265'],
    ['drums', 'Meher', '788 385 220 265'],
  ]);
  for (const artist of artists) assert(artist.name.includes(artist.highlight));
});

test('four instrument drawings draw and retrace independently without timed completion', () => {
  const anchors = [{ scroll: 0, length: 0 }];
  for (let i = 0; i < 4; i++) {
    anchors.push({ scroll: 1000 + i * 420, length: 3000 + i * 800 });
    anchors.push({ scroll: 1370 + i * 420, length: 3700 + i * 800 });
  }
  anchors.push({ scroll: 3300, length: 8000 });
  for (let i = 0; i < 4; i++) {
    const start = anchors[1 + i * 2];
    const end = anchors[2 + i * 2];
    for (const progress of [0, .25, .5, 1, .5, 0]) {
      const scroll = start.scroll + (end.scroll - start.scroll) * progress;
      assert.equal(scrollStrokeDistance(scroll, anchors), start.length + (end.length - start.length) * progress);
    }
  }
});

test('overlapping visible stages receive ordered scroll spans with no skipped drawing', () => {
  for (const [rowDistance, viewportHeight] of [[216, 900], [216, 1024], [390, 844], [390, 720]]) {
    const preferred = Array.from({ length: 4 }, (_, i) => ({
      start: 2000 + i * 800, end: 2800 + i * 800,
      scrollStart: 3000 + i * rowDistance - viewportHeight * .72,
      scrollEnd: 3160 + i * rowDistance - viewportHeight * .4,
    }));
    const spans = sequenceInstrumentSpans(preferred);
    assert.notEqual(spans[0], preferred[0], 'Does not mutate preferred measurements');
    const anchors = [{ scroll: 0, length: 0 }];
    for (const span of spans) {
      assert(span.scrollEnd > span.scrollStart);
      anchors.push({ scroll: span.scrollStart, length: span.start }, { scroll: span.scrollEnd, length: span.end });
    }
    for (let i = 1; i < spans.length; i++) assert(spans[i].scrollStart >= spans[i - 1].scrollEnd);
    for (const span of spans) {
      assert.equal(scrollStrokeDistance(span.scrollStart, anchors), span.start);
      assert.equal(scrollStrokeDistance(span.scrollEnd, anchors), span.end);
      assert(Math.abs(scrollStrokeDistance((span.scrollStart + span.scrollEnd) / 2, anchors) - (span.start + span.end) / 2) < 1e-8);
    }
  }
});

test('hero and every portrait use the clear source photograph rather than generated faces', () => {
  assert.equal(site.heroImageStyle, 'source-cutout');
  assert.equal(site.heroImage, '/images/band-source-clear.webp');
  for (const artist of artists) {
    assert.equal(artist.image, site.heroImage);
    assert(Math.abs(artist.cutout.sourceWidth / artist.cutout.sourceHeight - 6456 / 3944) < 1e-10, 'Source framing preserves photographic proportions');
  }
});

test('portrait contours are closed curves inside the chest-up crop bounds', () => {
  for (const { name, cutout } of artists) {
    assert(cutout.outline.startsWith('M') && cutout.outline.endsWith('Z'), `${name}: closed SVG path`);
    assert(cutout.outline.includes('C'), `${name}: curved hair and shoulder contour`);
    const [x, y, width, height] = cutout.viewBox.split(' ').map(Number);
    const values = coordinates(cutout.outline);
    assert.equal(values.length % 2, 0);
    for (let i = 0; i < values.length; i += 2) {
      assert(values[i] >= x && values[i] <= x + width, `${name}: contour remains in crop horizontally`);
      assert(values[i + 1] >= y && values[i + 1] <= y + height, `${name}: contour remains in crop vertically`);
    }
  }
});
