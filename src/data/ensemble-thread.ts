export type EnsemblePortrait = { x: number; y: number; width: number; height: number };

/** Continue the rail around one musician, then return to its vertical axis. */
export function ensembleThreadAt(railX: number, portrait: EnsemblePortrait, rowTop: number, rowBottom: number) {
  const gap = 7;
  const cx = portrait.x + portrait.width / 2;
  const cy = portrait.y + portrait.height / 2;
  const rx = portrait.width / 2 + gap;
  const ry = portrait.height / 2 + gap;
  const left = cx - rx;
  const right = cx + rx;
  const top = cy - ry;
  const bottom = cy + ry;
  const k = .5522847498; // Cubic approximation of a circular quarter.
  const p = (x: number, y: number) => `${Number(x.toFixed(3))} ${Number(y.toFixed(3))}`;
  // Enter at the crown, circle the portrait, then sweep back into the gutter.
  // All coordinates use layout bounds, so the cutout's reveal cannot move the rail.
  return `L${p(railX, rowTop)} C${p(railX, top)} ${p(right, top)} ${p(cx, top)}`
    + ` C${p(cx - rx * k, top)} ${p(left, cy - ry * k)} ${p(left, cy)}`
    + ` C${p(left, cy + ry * k)} ${p(cx - rx * k, bottom)} ${p(cx, bottom)}`
    + ` C${p(cx + rx * k, bottom)} ${p(right, cy + ry * k)} ${p(right, cy)}`
    + ` C${p(right, cy - ry * k)} ${p(cx + rx * k, top)} ${p(cx, top)}`
    + ` C${p(railX, top)} ${p(railX, bottom)} ${p(railX, rowBottom)}`;
}
