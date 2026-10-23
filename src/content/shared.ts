// Language independent data: contact links, media paths, pacing and accents of the flight.
export const site = {
  name: "German Flores",
  alternateName: "Germán Flores", // how many people will type it
  url: "https://germanflores.dev",
  legacyHost: "germanflores.vercel.app", // first address of the site: redirects here (src/proxy.ts)
  email: "jflcgerman@gmail.com",
  linkedin: "https://www.linkedin.com/in/german-flores-0a7837156",
  year: 2026,
  photo: "/img/german.webp",
  // Last content change, for the sitemap and the structured data. Bump it when the copy changes, not on every deploy:
  // search engines stop trusting a date that is always today.
  updated: "2026-10-19",
  // Structured data (Person.knowsAbout): what search engines should associate the name with.
  knowsAbout: ["React Native", "Next.js", "TypeScript", "iOS", "Android", "Mobile security", "Fintech", "AI agents"],
} as const;

export const palette = {
  bg: "#0F1428",
  surface: "#141B2E",
  ink: "#E8ECF5",
  violet: "#7C5CFF",
  cyan: "#22D3EE",
  mint: "#34D399",
} as const;

export type SceneId = "estudio" | "mony" | "boveda" | "taller-ia" | "control" | "final";

// Order matters: it is the order of the flight. `scroll` is viewport heights of scroll per dive (more scroll =
// the video moves slower under the wheel), `linger` makes the camera settle mid scene while the copy peaks, and
// `peak` (0..1, default 0.5) is where a middle scene's copy is strongest and the tour stops on it.
export const scenes: {
  id: SceneId;
  accent: string;
  scroll: number;
  linger?: number;
  peak?: number;
}[] = [
  { id: "estudio", accent: "#9B87FF", scroll: 2.1, linger: 0.4 },
  { id: "mony", accent: "#22D3EE", scroll: 1.7 },
  // The vault entry ends in a very close, shallow focus shot of the door: its copy shows while the whole vault is
  // still in view and sharp.
  { id: "boveda", accent: "#B39DFF", scroll: 1.7, peak: 0.3 },
  { id: "taller-ia", accent: "#34D399", scroll: 1.8, linger: 0.3 },
  { id: "control", accent: "#22D3EE", scroll: 1.7 },
  { id: "final", accent: "#9B87FF", scroll: 2.1, linger: 0.4 },
];

// Viewport heights of scroll per bridge between scenes (10 to 12 s of video each).
export const BRIDGE_SCROLL = 1.6;

// Media lives in versioned folders and is served with a one year immutable cache (next.config.ts).
// Changing any clip or poster means a new folder (v2, v3...) and bumping this constant, never overwriting v1,
// or returning visitors would keep the old file. globals.css also points at the first poster of this version.
export const MEDIA = "v1";

// Desktop chain is 16:9 at 720p (Flow renders 720p; its 1080p download is only an upscale);
// the phone chain is a native 9:16 render at 720 wide (`-m` files). The engine picks `-m` on phones.
export const sceneAssets = (id: SceneId) => ({
  still: `/img/${MEDIA}/scenes/${id}.webp`,
  clip: `/vid/${MEDIA}/${id}.mp4`,
  stillMobile: `/img/${MEDIA}/scenes/${id}-m.webp`,
  clipMobile: `/vid/${MEDIA}/${id}-m.mp4`,
});

export const connectors = [1, 2, 3, 4, 5].map((i) => `/vid/${MEDIA}/conn${i}.mp4`);
export const connectorsMobile = [1, 2, 3, 4, 5].map((i) => `/vid/${MEDIA}/conn${i}-m.mp4`);

// Which tour the home page shows:
//   "chapters": phones (< 1024 px) get one scene at a time, TikTok style: each swipe plays a 4.2 s trip forward or
//               back. Wide screens keep the full screen scroll tour (it suits the look of the site there).
//   "scrub":    the scroll tour everywhere, phones included. Kept as a one line fallback.
export const TOUR: "chapters" | "scrub" = "chapters";

// Which tour wide screens (>= 1024 px) get, with TOUR = "chapters":
//   "chapters": the same as phones, in 16:9: one wheel gesture or arrow key plays the whole trip to the next scene.
//   "scrub":    the earlier full screen scroll tour (ScrollWorld, media v1). Kept as a one line fallback.
export const DESKTOP_TOUR: "chapters" | "scrub" = "chapters";

// Offer still images instead of the animated tour (MotionNotice): to systems that ask for reduced motion, and by
// default to data saver or 2G. Off since 2026-10-19 (German's call): the notice showed on many ordinary computers
// (Windows with animations off, remote desktop), and the tour only moves when the visitor swipes or scrolls; slow
// connections already fall back to crossfades on their own. true brings the notice and the choice back.
export const MOTION_CHOICE = false;

// Chapter tour media (native 9:16 on phones, 16:9 on wide screens), built by sw-work/scripts/build_tour.py. Same
// immutable cache rule as MEDIA: a change means a new folder.
//   v5 = H.264, 6 s trips with returns, gentle acceleration; also every still. The fallback that plays everywhere.
//   v6 = the same frames in AV1 and HEVC, about 55 % lighter at the same sharpness; each device gets the lightest one
//        it decodes in hardware.
//   v7 = the "lite" tier of each codec (fewer pixels), for connections too slow to bring a normal trip in time; the
//        player picks the tier from the measured speed (controller.ts, evaluateTier).
// Phones keep a keyframe every 4 frames (the trip follows the finger); wide screens only play trips, so theirs is every
// second. v2 to v4 stay published but unused.
const TOUR_MEDIA = "v5";

export type TourVariant = "phone" | "desktop";

// trips[k]: chapter k -> k + 1; backs[k]: chapter k + 1 -> k (the same frames in reverse). `kb` is about how big one
// trip is (average of the built files), so the player can tell what a connection can bring in time.
type Set = { type: string; kb: number; intro: string; trips: string[]; backs: string[]; lite?: Set };
const tripSet = (type: string, dir: string, kb: number, lite?: Set): Set => ({
  type,
  kb,
  intro: `${dir}/intro.mp4`,
  trips: [1, 2, 3, 4, 5].map((i) => `${dir}/t${i}.mp4`),
  backs: [1, 2, 3, 4, 5].map((i) => `${dir}/r${i}.mp4`),
  ...(lite ? { lite } : {}),
});

// The codec strings match the files (profile and level, from ffprobe); lite files carry the same ones.
const AV1 = 'video/mp4; codecs="av01.0.05M.08"';
const HEVC = 'video/mp4; codecs="hvc1.1.6.L93.90"';
const H264 = 'video/mp4; codecs="avc1.64001F"';

type Sizes = Record<"av1" | "hevc" | "h264" | "av1Lite" | "hevcLite" | "h264Lite", number>;

const tour = (key: "m" | "d", size: [number, number], kb: Sizes) => ({
  start: `/img/${TOUR_MEDIA}/${key}/start.webp`,
  rests: scenes.map((s) => `/img/${TOUR_MEDIA}/${key}/rest-${s.id}.webp`),
  size,
  // Lightest first, the fallback last.
  encodings: [
    tripSet(AV1, `/vid/v6/${key}/av1`, kb.av1, tripSet(AV1, `/vid/v7/${key}/av1`, kb.av1Lite)),
    tripSet(HEVC, `/vid/v6/${key}/hevc`, kb.hevc, tripSet(HEVC, `/vid/v7/${key}/hevc`, kb.hevcLite)),
    tripSet(H264, `/vid/${TOUR_MEDIA}/${key}`, kb.h264, tripSet(H264, `/vid/v7/${key}/h264`, kb.h264Lite)),
  ],
});

export const tourAssets = {
  phone: tour("m", [720, 1280], { av1: 1230, hevc: 1350, h264: 3000, av1Lite: 750, hevcLite: 830, h264Lite: 1630 }),
  desktop: tour("d", [1280, 720], { av1: 1000, hevc: 1700, h264: 2750, av1Lite: 700, hevcLite: 1000, h264Lite: 1500 }),
} satisfies Record<TourVariant, ReturnType<typeof tour>>;
