/** Spend one scroll-driven drawing distance across the route and final symbol. */
export function railOffsets(progress: number, routeLength: number, chakraLength: number) {
  const drawn = (routeLength + chakraLength) * Math.max(0, Math.min(1, progress));
  return {
    route: Math.max(0, routeLength - drawn),
    chakra: Math.max(0, chakraLength - Math.max(0, drawn - routeLength)),
  };
}

export type StrokeAnchor = { scroll: number; length: number };

/** SVG dash patterns restart for each subpath; reveal separate paths sequentially. */
export function strokePartOffsets(drawn: number, lengths: readonly number[]) {
  let remaining = Math.max(0, drawn);
  return lengths.map((length) => {
    const offset = Math.max(0, length - remaining);
    remaining = Math.max(0, remaining - length);
    return offset;
  });
}

/** Direct, reversible interpolation. No time-based playback or completion state. */
export function scrollStrokeDistance(scrollY: number, anchors: readonly StrokeAnchor[]) {
  if (!anchors.length || scrollY <= anchors[0].scroll) return anchors[0]?.length ?? 0;
  for (let i = 1; i < anchors.length; i++) {
    const previous = anchors[i - 1];
    const next = anchors[i];
    if (scrollY <= next.scroll) {
      const progress = (scrollY - previous.scroll) / Math.max(1, next.scroll - previous.scroll);
      return previous.length + (next.length - previous.length) * progress;
    }
  }
  return anchors[anchors.length - 1].length;
}
