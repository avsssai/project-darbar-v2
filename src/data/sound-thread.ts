/** A vertical, continuous waveform with fixed endpoints, shared by the rail and player. */
export function soundThreadAt(x: number, y: number, width: number, height: number, phase = 0): string {
  const center = x + width / 2;
  let d = `L${center} ${y}`;
  for (let i = 1; i <= 120; i++) {
    const progress = i / 120;
    const envelope = Math.sin(Math.PI * progress) ** 2;
    const signal = Math.sin(progress * Math.PI * 26 + phase) * .3
      + Math.sin(progress * Math.PI * 12 - phase * .7) * .12;
    const offset = envelope * signal * width;
    d += `L${(center + offset).toFixed(3)} ${(y + height * progress).toFixed(3)}`;
  }
  return d;
}
