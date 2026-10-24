import type { ArtistInstrument } from './ensemble-thread';

/** Positions share the hero's production 1454 × 1082 canvas. Arrow tips stop at
 * shoulders, never across faces. Names come from the musician records.
 */
export const heroCallouts: {
  instrument: ArtistInstrument;
  x: number;
  y: number;
  rotation: number;
  anchor: 'start' | 'middle' | 'end';
  path: string;
  tip: string;
}[] = [
  { instrument: 'keys', x: 165, y: 290, rotation: -8, anchor: 'start', path: 'M230 270 C205 244 254 217 293 236 C307 244 319 255 329 269', tip: 'M319 264 Q325 265 329 269 Q328 263 327 258' },
  { instrument: 'drums', x: 568, y: 430, rotation: -7, anchor: 'middle', path: 'M550 391 C514 371 497 341 516 320 C524 311 536 307 546 308', tip: 'M535 312 Q541 309 546 308 Q541 306 537 302' },
  { instrument: 'violin', x: 845, y: 344, rotation: 5, anchor: 'middle', path: 'M883 309 C913 280 920 254 900 241 C890 234 879 233 868 238', tip: 'M875 229 Q873 234 868 238 Q874 238 879 239' },
  { instrument: 'guitar', x: 1265, y: 422, rotation: 7, anchor: 'end', path: 'M1228 386 C1282 365 1274 323 1237 316 C1209 311 1180 308 1157 320', tip: 'M1164 311 Q1161 316 1157 320 Q1163 321 1168 319' },
];
