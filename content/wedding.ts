/**
 * SINGLE SOURCE OF TRUTH for the whole site.
 * Edit names, dates, venue and media paths here only.
 */

export type Version = 'friends' | 'family';

export interface MediaRef {
  /** Path under /public, e.g. "/media/hero-1.jpg". Missing files render an elegant placeholder. */
  src: string;
  alt: string;
  /** Caption shown inside the placeholder frame when the file is missing. */
  caption: string;
}

export const wedding = {
  site: {
    title: 'Naveen Sagar & Jayashree | Wedding Invitation',
    description: 'With the blessings of our families, we invite you to celebrate the beginning of a beautiful journey.',
    /** Set to your real domain for correct link previews, e.g. https://naveenjayashree.com */
    url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://wedding-naveen-jayashree.vercel.app',
    ogImage: '/og.jpg',
  },

  couple: {
    groom: { name: 'Naveen Sagar M.', short: 'Naveen' },
    bride: { name: 'Jayashree M (Sindhu)', short: 'Jayashree' },
    ampersandNames: 'Naveen & Jayashree',
  },

  hero: {
    /** The entire Kannada content of the site — one line, nothing more. "ಶುಭ ವಿವಾಹ" = "auspicious wedding". */
    kannadaBlessing: 'ಶುಭ ವಿವಾಹ',
    blessing: 'With the blessings of our families',
    invite: 'invite you to celebrate the beginning of a beautiful journey',
    dates: '13 and 14 December 2026, Hosakote',
    scroll: 'Scroll',
    motif: { src: '/media/elephant-motif.jpg', alt: 'Quilled-art elephant motif', caption: 'Elephant motif' } as MediaRef,
  },

  families: {
    heading: 'Two families, becoming one',
    bride: {
      label: 'The bride’s family',
      parents: ['Sri Muthumani C', 'Smt Shoba'],
      parentsNote: '', // shown on family version only
      town: 'Hosakote',
      address: 'Kaveri Nagar, Hosakote Town, Bengaluru Rural District, Karnataka.',
      description: 'A close, loving family rooted in Hosakote town.',
    },
    groom: {
      label: 'The groom’s family',
      parents: ['Smt. C. Manjula', 'Sri. G.N. Madappa Chettiar'],
      town: 'Hosakote',
      address: 'Papanna Layout, Hosakote Town, Bengaluru Rural District, Karnataka.',
      description: 'A warm, generous family who hold their traditions dear.',
    },
  },

  beginning: {
    line: 'Two hearts who found each other. Two families who knew it was right.',
    portraits: [
      { src: '/media/portrait-1.jpg', alt: 'Naveen and Jayashree together', caption: 'Couple portrait' },
      { src: '/media/portrait-2.jpg', alt: 'Naveen and Jayashree smiling', caption: 'Couple portrait' },
    ] as MediaRef[],
  },

  blessings: {
    heading: 'Blessed Together',
    photo: { src: '/media/blessings-couple.jpg', alt: 'Naveen and Jayashree', caption: 'Together' } as MediaRef,
    elders: [
      { quote: 'May your home always be filled with patience, laughter and love.', by: 'Parents' },
      { quote: 'Two families, one blessing. We could not be happier.', by: 'Elders of the family' },
    ],
    friends: [
      { quote: 'We have never seen Naveen this happy and relaxed.', by: 'A friend of Naveen' },
      { quote: 'Jayashree brings so much joy wherever she goes.', by: 'A friend of Jayashree' },
    ],
  },

  celebrations: {
    heading: 'The celebrations',
    kicker: 'Two days, two ceremonies, one beginning.',
    printedLine:
      'One moment, two hearts, three knots, seven steps, a dozen promises and a lifetime of togetherness',
    formalInvitation:
      'We solicit your gracious presence with family and friends on the auspicious occasion of the marriage of our son and daughter.',
    awaiting: {
      label: 'Awaiting your presence',
      names: ['Sri. G.N. Madappa Chettiar & Smt. C. Manjula', 'Sri Muthumani C & Smt Shoba'],
    },
    events: [
      {
        id: 'reception',
        title: 'Reception',
        day: 'Sunday',
        date: '13 December 2026',
        time: '6:30 pm onwards',
        meaning: 'An evening to meet, greet and bless the couple.',
      },
      {
        id: 'muhurtham',
        title: 'Muhurtham',
        day: 'Monday',
        date: '14 December 2026',
        time: '5:30 am to 6:30 am',
        meaning: 'The sacred hour of three knots and seven steps. Lagna: Viruchiga.',
      },
    ],
  },

  moments: {
    heading: 'Moments',
    kicker: 'A few frames from along the way.',
    /** Family shows the first 4, friends shows all 5. */
    photos: [1, 2, 3, 5, 6].map((n) => ({
      src: `/media/moment-${n}.jpg`,
      alt: `A moment along the way, photograph ${n}`,
      caption: '',
    })) as MediaRef[],
    counts: { family: 4, friends: 5 },
  },

  venue: {
    heading: 'The venue',
    kicker: 'One address, both days.',
    mapCaption: 'Hosakote',
    name: 'Sri Chowdeshwari Kalyana Mantapa',
    locality: 'Kannurahalli Main Road, Hosakote, Karnataka, India',
    photo: { src: '/media/venue-hall.jpg', alt: 'The hall at Sri Chowdeshwari Kalyana Mantapa', caption: 'The hall' } as MediaRef,
    get full() {
      return `${this.name}, ${this.locality}`;
    },
    get mapsUrl() {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.full)}`;
    },
    get directionsUrl() {
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(this.full)}`;
    },
  },

  closing: {
    countdownTarget: '2026-12-14T05:30:00+05:30',
    countdownLabels: { days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds' },
    countdownSentence: 'until the muhurtham.',
    doneLine: 'Today is the day. Thank you for being with us.',
    farewell: 'With love and gratitude',
    line: 'Your blessings will make our beginning complete.',
    wishes: 'With best wishes from Relatives & Friends',
    photo: { src: '/media/closing.jpg', alt: 'Naveen and Jayashree', caption: 'Closing portrait' } as MediaRef,
  },

  hero_media: {
    // Slow image sequence slots. Optional looping video: set `video` + `poster`.
    video: { src: '/media/hero.mp4', poster: '/media/hero-poster.jpg' },
    slides: [
      { src: '/media/hero-temple.jpg', alt: 'The family temple', caption: 'Temple' },
      { src: '/media/hero-engagement.jpg', alt: 'The engagement ceremony', caption: 'Engagement' },
      { src: '/media/hero-blessings.jpg', alt: 'Families gathered in blessing', caption: 'Family blessings' },
      { src: '/media/hero-couple.jpg', alt: 'Naveen and Jayashree', caption: 'Couple portrait' },
    ] as MediaRef[],
  },

  music: { src: '/media/music.mp3', label: 'Music' },

  entry: { prompt: 'Enter', caption: 'Please join us' },
} as const;

export type Wedding = typeof wedding;
