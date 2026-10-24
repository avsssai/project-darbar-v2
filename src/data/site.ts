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
    introduction: 'Indian classical melodies, contemporary grooves, and room to explore.',
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
  cutout?: { viewBox: string; outline: string };
};

export const artists: Artist[] = [
  {
    name: 'Koundinya Pannala',
    highlight: 'Koundinya',
    instrument: 'violin',
    role: 'Violin',
    bio: 'Koundinya carries the melody through expressive violin playing rooted in Carnatic tradition.',
    image: '/images/band-cutout-v2.png',
    cutout: {
      viewBox: '715 40 285 855',
      outline: '735,40 940,40 940,270 958,350 940,520 937,710 935,900 950,1060 710,1060 735,900 750,760 758,620 760,500 750,330',
    },
  },
  {
    name: 'Manas Kanukollu',
    highlight: 'Manas',
    instrument: 'keys',
    role: 'Keys',
    bio: 'Manas brings piano, synths, and a love of cinematic sound to the ensemble.',
    image: '/images/band-cutout-v2.png',
    cutout: {
      viewBox: '185 105 340 790',
      outline: '185,105 485,105 485,400 500,500 508,620 498,658 479,720 473,1060 185,1060',
    },
  },
  {
    name: 'Chandra Mouli Mangudi',
    highlight: 'Mouli',
    instrument: 'guitar',
    role: 'Guitar',
    bio: 'Mouli brings acoustic warmth, electric energy, and a love of exploring genres.',
    image: '/images/band-cutout-v2.png',
    cutout: {
      viewBox: '935 105 355 790',
      outline: '960,105 1290,105 1290,1060 980,1060 980,760 995,650 985,550 980,450 980,330 960,270',
    },
  },
  {
    name: 'M. Meher Sri',
    highlight: 'Meher',
    instrument: 'drums',
    role: 'Drums & percussion',
    bio: 'Meher brings classical rhythms and contemporary grooves into a shared musical conversation.',
    image: '/images/band-cutout-v2.png',
    cutout: {
      viewBox: '480 105 280 790',
      outline: '495,105 730,105 730,300 732,440 738,610 732,790 716,895 716,1060 480,1060 480,900 489,730 515,620 500,480 490,340',
    },
  },
];
