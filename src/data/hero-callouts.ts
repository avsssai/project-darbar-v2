import type { ArtistInstrument } from './ensemble-thread';

/** Positions share the hero's production 1454 × 1082 canvas. Arrow tips stop at
 * shoulders, never across faces. Names come from the musician records.
 */
type CalloutPlacement = {
  x: number;
  y: number;
  rotation: number;
  anchor: 'start' | 'middle' | 'end';
  path: string;
  tip: string;
};

export const heroCallouts: (CalloutPlacement & { instrument: ArtistInstrument; mobile: CalloutPlacement })[] = [
  { instrument: 'keys', x: 165, y: 290, rotation: -8, anchor: 'start', path: 'M230 270 C205 244 254 217 293 236 C307 244 319 255 329 269', tip: 'M319 264 Q325 265 329 269 Q328 263 327 258', mobile: { x: 310, y: 370, rotation: -6, anchor: 'start', path: 'M445 338 C480 310 440 274 397 278 C388 278 381 282 376 290', tip: 'M375 280 Q380 285 376 290 Q382 287 386 283' } },
  { instrument: 'drums', x: 568, y: 430, rotation: -7, anchor: 'middle', path: 'M550 391 C514 371 497 341 516 320 C524 311 536 307 546 308', tip: 'M535 312 Q541 309 546 308 Q541 306 537 302', mobile: { x: 620, y: 445, rotation: -4, anchor: 'middle', path: 'M525 400 C486 373 500 334 546 314', tip: 'M535 313 Q540 315 546 314 Q542 320 538 322' } },
  { instrument: 'violin', x: 845, y: 344, rotation: 5, anchor: 'middle', path: 'M883 309 C913 280 920 254 900 241 C890 234 879 233 868 238', tip: 'M875 229 Q873 234 868 238 Q874 238 879 239', mobile: { x: 845, y: 354, rotation: 3, anchor: 'middle', path: 'M940 284 C975 244 932 217 877 235', tip: 'M883 226 Q880 232 877 235 Q883 235 889 237' } },
  { instrument: 'guitar', x: 1265, y: 422, rotation: 7, anchor: 'end', path: 'M1228 386 C1282 365 1274 323 1237 316 C1209 311 1180 308 1157 320', tip: 'M1164 311 Q1161 316 1157 320 Q1163 321 1168 319', mobile: { x: 1110, y: 445, rotation: 5, anchor: 'end', path: 'M1116 402 C1156 376 1158 342 1112 325', tip: 'M1123 324 Q1118 325 1112 325 Q1117 330 1120 333' } },
];
