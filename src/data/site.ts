/** Replace the sample entries here when the band's confirmed details are available. */
export const site = {
  name: 'The Project Darbar',
  tagline: 'Carnatic roots. New frequencies.',
  description:
    'A home for The Project Darbar, an Indian Carnatic fusion band exploring tradition and contemporary sound.',
  email: '',
  youtube: '',
  instagram: '',
} as const;

export type MusicEntry = {
  title: string;
  subtitle: string;
  note: string;
  youtubeId?: string;
};

export const music: MusicEntry[] = [
  {
    title: 'Performance 01',
    subtitle: 'Sample showcase',
    note: 'Add a performance title, a short description, and its YouTube video ID.',
  },
  {
    title: 'Performance 02',
    subtitle: 'Sample showcase',
    note: 'Use this space for a live session, original composition, or collaboration.',
  },
  {
    title: 'Performance 03',
    subtitle: 'Sample showcase',
    note: 'A third preview keeps the music section ready for the next release.',
  },
];

export type Artist = {
  name: string;
  role: string;
  bio: string;
  image?: string;
};

export const artists: Artist[] = [
  {
    name: 'Artist 01',
    role: 'Role to add',
    bio: 'Add the artist’s name, instrument or role, and a short introduction.',
  },
  {
    name: 'Artist 02',
    role: 'Role to add',
    bio: 'Share the musical voice and background this artist brings to the band.',
  },
  {
    name: 'Artist 03',
    role: 'Role to add',
    bio: 'Introduce the person behind the sound and their place in the ensemble.',
  },
  {
    name: 'Artist 04',
    role: 'Role to add',
    bio: 'Add a final profile or remove this card if the lineup is smaller.',
  },
];
