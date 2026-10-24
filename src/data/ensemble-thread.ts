export const artistInstruments = ['violin', 'keys', 'guitar', 'drums'] as const;
export type ArtistInstrument = typeof artistInstruments[number];
export type InstrumentStage = { x: number; y: number; width: number; height: number };

/** One unbroken stroke per instrument in a 120 × 160 stage.
 * Each starts at the top-right and leaves at the bottom-right, joining the rail.
 * Retraced edges let the pen draw internal details without disconnected subpaths.
 */
const motifs: Record<ArtistInstrument, string> = {
  violin: `L120 0 C100 0 82 8 64 12
    C55 5 48 11 53 18 C57 24 64 20 62 15
    L62 48 C76 37 88 47 85 57 C82 64 73 64 75 72
    C77 80 92 80 94 95 C98 116 79 132 62 126
    C42 132 25 116 29 95 C31 81 46 80 48 72
    C50 64 40 64 38 57 C35 47 47 37 58 48
    L58 20 L62 20 L62 112 L53 112 L53 107 L71 107 L71 112 L62 112
    L62 92 L55 92 L69 92 L62 92 L62 48
    L93 22 L97 25 L43 130 L39 127 L93 22
    C106 58 108 124 120 160`,
  keys: `L120 0 C118 20 108 30 104 44
    L16 44 L16 112 L104 112 L104 44 L16 44
    L16 57 L104 57 L104 112
    L93 112 L93 57 L93 112 L82 112 L82 57
    L82 85 L77 85 L77 57 L82 57 L82 112
    L71 112 L71 57 L71 112 L60 112 L60 57
    L60 85 L55 85 L55 57 L60 57 L60 112
    L49 112 L49 57 L49 85 L44 85 L44 57 L49 57 L49 112
    L38 112 L38 57 L38 112 L27 112 L27 57
    L27 85 L22 85 L22 57 L27 57 L27 112 L104 112
    C113 123 115 143 120 160`,
  guitar: `L120 0 C102 2 81 9 72 13
    L59 10 L53 34 L58 36 L50 70
    C40 60 26 65 27 78 C29 88 17 88 18 105
    C19 130 51 143 71 127 C86 115 88 94 77 87
    C67 81 78 71 67 68 L67 38 L72 39 L79 15 L72 13
    L65 35 L54 106 L41 102 L40 107 L60 113 L62 108 L54 106
    L59 86 C68 81 59 70 53 77 C46 85 55 94 59 86
    L65 35 L58 34 L72 13
    C100 39 103 135 120 160`,
  drums: `L120 0 C103 0 93 11 90 24
    L34 61 L30 57 L87 20 L90 24 L62 43
    L34 21 L30 25 L86 64 L90 60 L34 21
    C36 40 21 45 16 61
    C16 44 104 44 104 61 C104 78 16 78 16 61
    L16 105 C16 124 104 124 104 105 L104 61
    L94 68 L94 110 L87 113 L87 71 L34 71
    L34 113 L27 110 L27 68 L16 61
    L16 105 C16 124 104 124 104 105
    C113 123 115 143 120 160`,
};

const round = (n: number) => Number(n.toFixed(3));

export function artistInstrumentAt(instrument: ArtistInstrument, stage: InstrumentStage) {
  return motifs[instrument].replace(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g, (_, x, y) =>
    `${round(stage.x + Number(x) * stage.width / 120)} ${round(stage.y + Number(y) * stage.height / 160)}`,
  ).replace(/\s+/g, ' ');
}

/** Join a measured instrument stage to the page rail without circling the portrait. */
export function ensembleThreadAt(instrument: ArtistInstrument, railX: number, stage: InstrumentStage, rowTop: number, rowBottom: number) {
  const right = round(stage.x + stage.width);
  const bottom = round(stage.y + stage.height);
  return `L${railX} ${rowTop} C${railX} ${stage.y} ${right} ${stage.y} ${right} ${stage.y}`
    + artistInstrumentAt(instrument, stage)
    + ` C${railX} ${bottom} ${railX} ${bottom} ${railX} ${rowBottom}`;
}

/** Adjacent desktop stages can be visible together. Share their overlap so the
 * route always consumes each instrument's full length before starting the next.
 */
export function sequenceInstrumentSpans<T extends { scrollStart: number; scrollEnd: number }>(spans: readonly T[]): T[] {
  const result = spans.map((span) => ({ ...span }));
  for (let i = 0; i < result.length - 1; i++) {
    const current = result[i];
    const next = result[i + 1];
    if (current.scrollEnd > next.scrollStart) {
      const boundary = (current.scrollEnd + next.scrollStart) / 2;
      current.scrollEnd = boundary;
      next.scrollStart = boundary;
    }
  }
  return result;
}
