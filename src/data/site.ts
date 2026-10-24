import type { ArtistInstrument } from './ensemble-thread';

/** Confirmed site details and short, editable homepage copy. */
export const site = {
  name: 'The Project Darbar',
  tagline: 'Carnatic roots. New frequencies.',
  title: 'The Project Darbar | Indian Classical & Contemporary Fusion Band',
  description:
    'Meet The Project Darbar, an instrumental band bringing Carnatic melodies together with piano, guitar, and drums. Listen, meet the musicians, and plan a performance.',
  heroImage: '/images/band-cutout-v2.png',
  heroImageStyle: 'cutout' as 'cutout' | 'original-photo',
  email: 'theprojectdarbar@gmail.com',
  phone: '+917674918647',
  phoneLabel: '+91 76749 18647',
  youtube: 'https://www.youtube.com/results?search_query=the+project+darbar',
  instagram: 'https://www.instagram.com/the_project_darbar/',
} as const;

export const copy = {
  hero: {
    taglineLines: ['Carnatic roots.', 'New frequencies.'],
    listen: 'Hear the sound',
  },
  about: {
    heading: ['OLD ROOTS.', 'NEW FIRE.'],
    description: 'We bring Carnatic melodies together with piano, guitar, and drums, finding new ways to share the music we love.',
    instruments: 'VIOLIN / KEYS / GUITAR / DRUMS',
  },
  sound: {
    heading: ['RAGAS.', 'RIFFS.', 'ROOM TO PLAY.'],
    description: 'A raga starts it. A groove takes it somewhere new.',
  },
  contact: {
    heading: ["LET’S", 'PLAY.'],
    invitation: 'Planning something special? We’d love to bring our sound to your stage.',
    action: 'Enquire about a booking',
  },
} as const;

export type MusicEntry = {
  title: string;
  subtitle: string;
  note: string;
  youtubeId?: string;
  thumbnail?: string;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
};

export const music: MusicEntry[] = [
  {
    title: 'The Project Darbar',
    subtitle: 'Ensemble performance',
    note: 'Violin, keys, guitar, and drums. Come hear us play together.',
    youtubeId: '5FVp1YWyd28',
    thumbnail: '/images/music/5FVp1YWyd28.avif',
    thumbnailWidth: 360,
    thumbnailHeight: 202,
  },
  {
    title: 'Manavyalakincharadate',
    subtitle: 'Drive with Darbar',
    note: 'Come along for a session of Drive with Darbar.',
    youtubeId: 'EAhQd8oxbKo',
    thumbnail: '/images/music/EAhQd8oxbKo.avif',
    thumbnailWidth: 360,
    thumbnailHeight: 202,
  },
  {
    title: 'The Project Darbar',
    subtitle: 'Band performance',
    note: 'Spend a little more time with our sound. Watch the full performance.',
    youtubeId: 'H-3IpmyzSzk',
    thumbnail: '/images/music/H-3IpmyzSzk.avif',
    thumbnailWidth: 360,
    thumbnailHeight: 202,
  },
  {
    title: 'Madhava Mamava',
    subtitle: 'Drive with Darbar',
    note: 'Come along for a session of Drive with Darbar.',
    youtubeId: 'HKwedk2cVRE',
    thumbnail: '/images/music/HKwedk2cVRE.avif',
    thumbnailWidth: 720,
    thumbnailHeight: 404,
  },
  {
    title: 'Maha Ganapathim',
    subtitle: 'Drive with Darbar',
    note: 'Come along for a session of Drive with Darbar.',
    youtubeId: 'zb4hbnv7YvQ',
    thumbnail: '/images/music/zb4hbnv7YvQ.avif',
    thumbnailWidth: 720,
    thumbnailHeight: 404,
  },
];

export type Artist = {
  name: string;
  highlight: string;
  instrument: ArtistInstrument;
  role: string;
  bio: string;
  image?: string;
  cutout?: { viewBox: string; outline: string; sourceWidth: number; sourceHeight: number };
};

export const artists: Artist[] = [
  {
    name: 'Koundinya Pannala',
    highlight: 'Koundinya',
    instrument: 'violin',
    role: 'Violin',
    bio: 'Koundinya carries the melody through expressive violin playing rooted in Carnatic tradition.',
    image: '/images/band-source-clear.webp',
    cutout: {
      sourceWidth: 2016,
      sourceHeight: 3944 * 2016 / 6456,
      viewBox: '995 340 205 300',
      outline: '1001,640 1001,573 1006,523 1029,501 1038,489 1036,477 1023,461 1019,439 1010,419 1012,394 1024,373 1047,355 1077,348 1107,354 1130,370 1142,395 1141,420 1133,441 1127,461 1114,478 1113,488 1155,501 1179,525 1190,567 1195,640',
    },
  },
  {
    name: 'Manas Kanukollu',
    highlight: 'Manas',
    instrument: 'keys',
    role: 'Keys',
    bio: 'Manas brings piano, synths, and a love of cinematic sound to the ensemble.',
    image: '/images/band-source-clear.webp',
    cutout: {
      sourceWidth: 2016,
      sourceHeight: 3944 * 2016 / 6456,
      viewBox: '558 375 250 265',
      outline: '565,640 567,603 578,561 598,532 631,512 674,498 682,488 670,467 668,439 673,417 678,400 694,386 720,382 744,389 761,402 766,421 772,440 770,463 764,481 754,492 756,504 783,521 798,547 804,590 805,640',
    },
  },
  {
    name: 'Chandra Mouli Mangudi',
    highlight: 'Mouli',
    instrument: 'guitar',
    role: 'Guitar',
    bio: 'Mouli brings acoustic warmth, electric energy, and a love of exploring genres.',
    image: '/images/band-source-clear.webp',
    cutout: {
      sourceWidth: 2016,
      sourceHeight: 3944 * 2016 / 6456,
      viewBox: '1175 385 195 265',
      outline: '1180,650 1180,592 1186,551 1196,523 1209,509 1216,499 1203,488 1191,472 1186,452 1190,431 1203,413 1224,401 1249,395 1274,401 1291,417 1299,439 1299,462 1294,483 1286,498 1284,507 1321,519 1350,544 1364,583 1363,650',
    },
  },
  {
    name: 'M. Meher Sri',
    highlight: 'Meher',
    instrument: 'drums',
    role: 'Drums & percussion',
    bio: 'Meher brings classical rhythms and contemporary grooves into a shared musical conversation.',
    image: '/images/band-source-clear.webp',
    cutout: {
      sourceWidth: 2016,
      sourceHeight: 3944 * 2016 / 6456,
      viewBox: '793 385 215 265',
      outline: '801,650 797,600 799,552 809,529 846,505 855,494 847,474 845,451 850,425 864,407 889,394 914,396 937,406 954,426 959,450 957,473 949,492 944,502 973,517 991,547 998,593 1002,650',
    },
  },
];
