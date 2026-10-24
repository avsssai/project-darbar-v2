import type { ArtistInstrument } from './ensemble-thread';

/** Confirmed site details and short, editable homepage copy. */
export const site = {
  name: 'The Project Darbar',
  tagline: 'Carnatic roots. New frequencies.',
  title: 'The Project Darbar | Indian Classical & Contemporary Fusion Band',
  description:
    'Meet The Project Darbar, an instrumental band bringing Carnatic melodies together with piano, guitar, and drums. Listen, meet the musicians, and plan a performance.',
  heroImage: '/images/band-cutout-clear.webp',
  heroImageStyle: 'source-cutout' as 'source-cutout' | 'cutout' | 'original-photo',
  email: 'theprojectdarbar@gmail.com',
  phone: '+917674918647',
  phoneLabel: '+91 76749 18647',
  youtube: 'https://www.youtube.com/results?search_query=the+project+darbar',
  instagram: 'https://www.instagram.com/the_project_darbar/',
} as const;

export const copy = {
  hero: {
    taglineLines: ['Carnatic roots.', 'New frequencies.'],
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
      outline: 'M1000 640 C1000 617 1001 589 1005 565 C1008 545 1011 536 1007 522 C1005 514 1007 506 1015 502 C1026 496 1041 491 1051 486 L1052 477 C1052 468 1048 462 1042 453 C1040 449 1037 444 1038 438 C1035 434 1035 425 1033 419 C1025 411 1023 402 1024 392 C1024 386 1027 378 1032 375 C1029 369 1037 365 1041 365 C1043 359 1051 359 1054 358 C1060 352 1067 356 1071 353 C1077 350 1082 353 1088 353 C1095 351 1100 356 1103 357 C1110 358 1113 363 1117 368 C1124 372 1127 382 1126 386 C1131 392 1130 401 1128 406 C1130 415 1125 422 1120 429 C1120 440 1117 447 1111 449 C1109 458 1106 464 1105 473 L1104 477 C1113 477 1114 483 1118 485 C1135 490 1158 495 1171 510 C1183 522 1187 540 1191 557 C1195 578 1196 609 1197 640 Z',
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
      outline: 'M576 640 C571 628 569 612 571 600 C574 579 579 560 591 548 C606 531 633 519 655 511 L680 503 C685 500 687 496 688 491 C682 485 680 480 679 475 C674 473 674 467 675 460 C674 454 676 449 679 449 C676 443 675 437 676 430 C675 424 680 418 681 414 C680 408 687 402 692 401 C694 395 702 393 708 394 C712 388 719 391 723 391 C731 389 734 395 739 396 C746 397 749 404 751 408 C757 413 758 421 757 426 C760 434 757 443 758 449 C762 452 762 460 760 466 C760 473 756 478 754 481 C753 490 749 497 747 501 L748 507 C757 510 759 515 762 519 C774 523 784 530 791 540 C798 560 800 586 801 611 L803 640 Z',
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
      outline: 'M1199 650 C1197 628 1193 607 1190 589 C1187 569 1182 553 1180 539 C1188 530 1201 522 1213 517 L1224 510 L1223 500 C1215 496 1208 491 1203 484 C1192 484 1183 478 1179 472 C1190 475 1196 463 1194 453 L1196 446 C1197 438 1197 430 1201 425 C1204 415 1213 410 1220 407 C1227 401 1238 399 1247 399 C1261 399 1271 406 1276 414 C1284 419 1289 432 1289 441 C1292 452 1288 464 1285 471 C1283 476 1279 480 1276 481 L1275 477 C1280 489 1294 500 1306 505 C1318 510 1333 512 1342 517 C1350 524 1356 537 1358 550 C1362 570 1364 589 1364 611 L1363 650 Z',
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
      viewBox: '788 385 220 265',
      outline: 'M797 650 C793 629 792 605 793 583 C793 563 798 542 807 531 C815 524 835 520 850 512 C858 508 864 500 870 492 L874 485 C872 482 870 479 869 476 C865 477 862 471 862 466 C859 461 861 453 865 452 C862 444 864 434 868 428 C870 419 877 413 882 409 C886 403 892 402 898 400 C905 397 914 400 920 403 C930 405 938 413 943 421 C948 429 949 440 947 451 C951 454 950 462 948 467 C949 473 944 478 940 478 L939 498 C940 507 945 513 953 517 C965 520 976 524 982 535 C990 549 992 567 994 583 L999 650 Z',
    },
  },
];
