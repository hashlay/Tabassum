import fs from 'fs';

const fileContent = `import { HouseScore, ResultItem, Stage, GalleryItem, VideoHighlight, SmilePhoto, HeroMedia, ParticipantProfile } from '../types';

export const INSTITUTION = {
  name: "Kulliyathu Imam Rabbani",
  tagline: "Off-Campus of Markaz Garden, Poonoor",
  eventTitle: "Rendezvous Silver Edition",
  subTitle: "Imam Rabbani LIFE Festival",
  theme: "Transcending the Illusions",
  dates: "September 23 – 24, 2025",
  location: "Main Campus Grounds, Poonoor, Kozhikode",
  email: "contact@imamrabbani.edu.in",
  phone: "+91 98471 23456",
  socials: {
    instagram: "https://instagram.com/kulliyathu_imam_rabbani",
    youtube: "https://youtube.com/@imamrabbanifestival",
    facebook: "https://facebook.com/imamrabbaniofficial"
  }
};

export const DEFAULT_HERO_MEDIA: HeroMedia[] = [
  { id: 'hm-1', type: 'image', url: '/hero1.jpg', title: 'Inaugural Session', caption: 'Rendezvous Silver Edition' },
  { id: 'hm-2', type: 'image', url: '/hero2.jpg', title: 'Festival Scholars', caption: 'Rendezvous Silver Edition' }
];

export const DEMO_PARTICIPANTS: ParticipantProfile[] = [];

export const HOUSE_SCORES: HouseScore[] = [
  { id: 'h1', name: 'Imam Rabbani House', code: 'IRH', color: '#FF2B2B', accentColor: 'from-[#FF2B2B] to-[#990000]', totalPoints: 0, goldCount: 0, silverCount: 0, bronzeCount: 0 },
  { id: 'h2', name: 'Markaz Campus Wing', code: 'MCW', color: '#E5E7EB', accentColor: 'from-slate-200 to-slate-500', totalPoints: 0, goldCount: 0, silverCount: 0, bronzeCount: 0 },
  { id: 'h3', name: 'Shari’a Faculty', code: 'SHF', color: '#38BDF8', accentColor: 'from-sky-400 to-blue-600', totalPoints: 0, goldCount: 0, silverCount: 0, bronzeCount: 0 },
  { id: 'h4', name: 'Tahfeez & Quranic Wing', code: 'TQW', color: '#F59E0B', accentColor: 'from-[#F59E0B] to-amber-700', totalPoints: 0, goldCount: 0, silverCount: 0, bronzeCount: 0 }
];

export const RESULTS_DATA: ResultItem[] = [];

export const STAGES_DATA: Stage[] = [
  {
    id: 'stage-1',
    name: 'Main Stage — Grand Auditorium',
    location: 'Central Campus Lawn',
    streamUrl: 'https://www.youtube.com/embed/live_stream?channel=UC_demo1',
    videoEmbedId: '5qap5aO4i9A',
    isLive: false,
    currentProgram: '',
    nextProgram: '',
    schedule: []
  },
  {
    id: 'stage-2',
    name: 'Stage 2 — Literary Arena',
    location: 'Imam Rabbani Block B',
    streamUrl: 'https://www.youtube.com/embed/live_stream?channel=UC_demo2',
    videoEmbedId: 'L_LUpnjgPso',
    isLive: false,
    currentProgram: '',
    nextProgram: '',
    schedule: []
  }
];

export const GALLERY_DATA: GalleryItem[] = [];

export const VIDEO_HIGHLIGHTS: VideoHighlight[] = [];

export const SMILE_PHOTOS: SmilePhoto[] = [];

export const FULL_CONCEPT_TEXT = {
  title: "Transcending the Illusions",
  institution: "Kulliyathu Imam Rabbani",
  paragraphs: [
    "In an era dominated by hyper-digital sensory overload, the human spirit is increasingly trapped.",
    "The Silver Edition celebrates a milestone legacy of nurturing scholars, leaders, and artists who embody moral integrity."
  ]
};
`;

fs.writeFileSync('src/data/festivalData.ts', fileContent);
console.log('Clean dataset written to src/data/festivalData.ts');
