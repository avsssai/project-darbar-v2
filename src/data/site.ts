/** Add confirmed video IDs and lineup details as they become available. */
export const site = {
  name: 'The Project Darbar',
  tagline: 'Carnatic roots. New frequencies.',
  description:
    'A home for The Project Darbar, an Indian Carnatic fusion band exploring tradition and contemporary sound.',
  heroImage: '/images/band-cutout-v2.png',
  heroImageStyle: 'cutout' as 'cutout' | 'original-photo',
  email: '',
  youtube: 'https://www.youtube.com/results?search_query=the+project+darbar',
  instagram: 'https://www.instagram.com/the_project_darbar/',
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
    note: 'Keys, percussion, violin and bass. The sound of The Project Darbar.',
    youtubeId: '5FVp1YWyd28',
    thumbnail: '/images/music/5FVp1YWyd28.avif',
    thumbnailWidth: 360,
    thumbnailHeight: 202,
  },
  {
    title: 'Manavyalakincharadate',
    subtitle: 'Drive with Darbar',
    note: 'A selection from Drive with Darbar.',
    youtubeId: 'EAhQd8oxbKo',
    thumbnail: '/images/music/EAhQd8oxbKo.avif',
    thumbnailWidth: 360,
    thumbnailHeight: 202,
  },
  {
    title: 'The Project Darbar',
    subtitle: 'Band performance',
    note: 'Another side of the ensemble. Watch the full performance.',
    youtubeId: 'H-3IpmyzSzk',
    thumbnail: '/images/music/H-3IpmyzSzk.avif',
    thumbnailWidth: 360,
    thumbnailHeight: 202,
  },
  {
    title: 'Madhava Mamava',
    subtitle: 'Drive with Darbar',
    note: 'A selection from Drive with Darbar.',
    youtubeId: 'HKwedk2cVRE',
    thumbnail: '/images/music/HKwedk2cVRE.avif',
    thumbnailWidth: 720,
    thumbnailHeight: 404,
  },
  {
    title: 'Maha Ganapathim',
    subtitle: 'Drive with Darbar',
    note: 'A selection from Drive with Darbar.',
    youtubeId: 'zb4hbnv7YvQ',
    thumbnail: '/images/music/zb4hbnv7YvQ.avif',
    thumbnailWidth: 720,
    thumbnailHeight: 404,
  },
];

export type Artist = {
  name: string;
  role: string;
  bio: string;
  image?: string;
  cutout?: { viewBox: string; outline: string };
};

export const artists: Artist[] = [
  {
    name: '',
    role: 'Keys',
    bio: 'Keyboard & synthesizer',
    image: '/images/band-cutout-v2.png',
    cutout: {
      viewBox: '185 105 340 790',
      outline: '185,105 485,105 485,400 500,500 508,620 498,658 479,720 473,1060 185,1060',
    },
  },
  {
    name: '',
    role: 'Percussion',
    bio: 'Drums & percussion',
    image: '/images/band-cutout-v2.png',
    cutout: {
      viewBox: '480 105 280 790',
      outline: '495,105 730,105 730,300 732,440 738,610 732,790 716,895 716,1060 480,1060 480,900 489,730 515,620 500,480 490,340',
    },
  },
  {
    name: '',
    role: 'Violin',
    bio: 'Bowed strings & melody',
    image: '/images/band-cutout-v2.png',
    cutout: {
      viewBox: '715 40 285 855',
      outline: '735,40 940,40 940,270 958,350 940,520 937,710 935,900 950,1060 710,1060 735,900 750,760 758,620 760,500 750,330',
    },
  },
  {
    name: '',
    role: 'Bass',
    bio: 'Bass guitar & low-end groove',
    image: '/images/band-cutout-v2.png',
    cutout: {
      viewBox: '935 105 355 790',
      outline: '960,105 1290,105 1290,1060 980,1060 980,760 995,650 985,550 980,450 980,330 960,270',
    },
  },
];
