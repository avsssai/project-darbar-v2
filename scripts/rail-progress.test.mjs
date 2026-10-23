import assert from 'node:assert/strict';
import test from 'node:test';
import { railOffsets, scrollStrokeDistance, strokePartOffsets } from '../src/lib/rail-progress.ts';
import { instrumentThreadAt } from '../src/data/instrument-thread.ts';
import { brandLinePartsAt } from '../src/data/brand.ts';

test('equal scroll steps reveal equal stroke lengths, including the final symbol', () => {
  // Deliberately unequal route/symbol proportions expose a fixed-percentage handoff.
  const route = 4200;
  const chakra = 1400;
  const drawn = (progress) => {
    const offsets = railOffsets(progress, route, chakra);
    return route + chakra - offsets.route - offsets.chakra;
  };
  for (const start of [.1, .7, .74, .75, .9, .98]) {
    assert(Math.abs(drawn(start + .01) - drawn(start) - 56) < 1e-8);
  }
});

test('stopping and reversing scroll do not advance or finish the symbol', () => {
  assert.deepEqual(railOffsets(.9, 4200, 1400), railOffsets(.9, 4200, 1400));
  const later = railOffsets(.95, 4200, 1400);
  const earlier = railOffsets(.8, 4200, 1400);
  assert(earlier.chakra > later.chakra);
  const beforeSymbol = railOffsets(.7, 4200, 1400);
  assert(Math.abs(beforeSymbol.route - 280) < 1e-8);
  assert.equal(beforeSymbol.chakra, 1400);
});

test('the whole drawing completes at the bottom and clamps overscroll', () => {
  assert.deepEqual(railOffsets(-1, 4200, 1400), { route: 4200, chakra: 1400 });
  assert.deepEqual(railOffsets(1, 4200, 1400), { route: 0, chakra: 0 });
  assert.deepEqual(railOffsets(2, 4200, 1400), { route: 0, chakra: 0 });
});

test('the instrument formation is tied to section scrolling and retraces exactly', () => {
  const anchors = [{ scroll: 0, length: 0 }, { scroll: 100, length: 120 }, { scroll: 500, length: 3120 }, { scroll: 1000, length: 6000 }];
  const positions = [0, 100, 300, 500, 750, 1000];
  const forward = positions.map((y) => scrollStrokeDistance(y, anchors));
  assert.deepEqual(forward, [0, 120, 1620, 3120, 4560, 6000]);
  assert.deepEqual([...positions].reverse().map((y) => scrollStrokeDistance(y, anchors)), [...forward].reverse());
  assert.equal(scrollStrokeDistance(-100, anchors), 0);
  assert.equal(scrollStrokeDistance(1100, anchors), 6000);
});

test('the four instruments remain one stroke and leave at the stage exit after resizing', () => {
  for (const [x, y, width, height] of [[0, 0, 600, 480], [10, 20, 300, 240], [22, 500, 240, 192]]) {
    const path = instrumentThreadAt(x, y, width, height);
    assert(path.startsWith('C'));
    assert(!/[Mm]/.test(path), 'No disconnected moves between instruments');
    assert(!/NaN|Infinity/.test(path));
    assert(path.endsWith(`${x + width} ${y + height}`));
  }
});

test('the logo parts consume one continuous drawing budget without a simultaneous final reveal', () => {
  const lengths = [300, 100, 100, 14, 14, 14];
  const total = lengths.reduce((sum, value) => sum + value, 0);
  for (let drawn = 0; drawn <= total; drawn++) {
    const offsets = strokePartOffsets(drawn, lengths);
    const visible = total - offsets.reduce((sum, value) => sum + value, 0);
    assert.equal(visible, drawn);
    assert(offsets.filter((offset, i) => offset > 0 && offset < lengths[i]).length <= 1);
  }
  assert.deepEqual(strokePartOffsets(325, lengths), [0, 75, 100, 14, 14, 14]);
  assert.deepEqual(strokePartOffsets(150, lengths), [150, 100, 100, 14, 14, 14]);
  for (const path of brandLinePartsAt(360, 6000)) assert.equal(path.match(/M/g)?.length, 1);
});

test('ensemble and contact checkpoints do not finish the line before the actual bottom', () => {
  const anchors = [
    { scroll: 0, length: 0 }, { scroll: 2000, length: 4000 },
    { scroll: 2600, length: 4400 }, { scroll: 2810, length: 4700 },
    { scroll: 3400, length: 5300 }, { scroll: 4000, length: 6300 },
  ];
  assert.equal(scrollStrokeDistance(2600, anchors), 4400);
  assert.equal(scrollStrokeDistance(2810, anchors), 4700);
  assert.equal(scrollStrokeDistance(3400, anchors), 5300);
  assert.equal(scrollStrokeDistance(3700, anchors), 5800);
  assert(scrollStrokeDistance(3999, anchors) < 6300);
  assert.equal(scrollStrokeDistance(4000, anchors), 6300);
  assert.equal(scrollStrokeDistance(3700, anchors), 5800);
});
