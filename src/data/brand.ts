/** Place the logo's upper terminal on the thread, in actual viewport units.
 * Baking in the scale keeps getTotalLength() and scroll drawing speed consistent.
 */
export function brandLineAt(x: number, y: number, scale = .2) {
  const p = (px: number, py: number) => `${x + (px - 332) * scale} ${y + (py - 116) * scale}`;
  const px = (value: number) => x + (value - 332) * scale;
  const circle = (cx: number, cy: number, radius: number) => {
    const r = radius * scale;
    return `M${p(cx + radius, cy)}a${r} ${r} 0 1 1 ${-2 * r} 0a${r} ${r} 0 1 1 ${2 * r} 0`;
  };
  return `M${p(332, 116)}C${p(346, 94)} ${p(363, 58)} ${p(335, 73)}C${p(269, 99)} ${p(95, 247)} ${p(93, 324)}C${p(89, 376)} ${p(173, 397)} ${p(233, 397)}C${p(292, 395)} ${p(380, 330)} ${p(388, 384)}C${p(406, 484)} ${p(233, 660)} ${p(152, 706)}C${p(122, 724)} ${p(141, 694)} ${p(154, 674)}M${p(95, 168)}H${px(365)}L${p(233, 397)}ZM${p(233, 397)} ${p(365, 621)}H${px(103)}Z${circle(230, 263, 11)}${circle(332, 116, 9)}${circle(154, 674, 9)}`;
}

export function brandLinePartsAt(x: number, y: number, scale = .2) {
  return brandLineAt(x, y, scale).match(/M[^M]+/g) ?? [];
}
