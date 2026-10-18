// Language independent data: contact links, media paths, pacing and accents of the flight.
export const site = {
  name: "German Flores",
  url: "https://germanflores.vercel.app", // switch here when a custom domain exists
  email: "jflcgerman@gmail.com",
  linkedin: "https://www.linkedin.com/in/german-flores-0a7837156",
  year: 2026,
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

// Order matters: it is the order of the flight. `scroll` is viewport heights of scroll per dive,
// `linger` makes the camera settle mid scene while the copy peaks. Transit scenes stay brisk.
export const scenes: {
  id: SceneId;
  accent: string;
  scroll: number;
  linger?: number;
}[] = [
  { id: "estudio", accent: "#9B87FF", scroll: 1.7, linger: 0.4 },
  { id: "mony", accent: "#22D3EE", scroll: 1.3 },
  { id: "boveda", accent: "#B39DFF", scroll: 1.3 },
  { id: "taller-ia", accent: "#34D399", scroll: 1.4, linger: 0.3 },
  { id: "control", accent: "#22D3EE", scroll: 1.3 },
  { id: "final", accent: "#9B87FF", scroll: 1.7, linger: 0.4 },
];

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
//   "chapters": one scene at a time, each step plays a short trip (TikTok style on phones, text + sticky video
//               on wide screens). Media in v2, built by sw-work/scripts/build_tour.py.
//   "scrub":    the previous tour, the camera scrubbed by the scroll position. Media in v1, kept as a fallback.
export const TOUR: "chapters" | "scrub" = "chapters";

const TOUR_MEDIA = "v2"; // same immutable cache rule as MEDIA: a change means a new folder

// d = 16:9 for wide screens, m = native 9:16 for phones. trips[k] goes from chapter k to chapter k + 1.
export const tourAssets = (o: "d" | "m") => ({
  start: `/img/${TOUR_MEDIA}/${o}/start.webp`,
  intro: `/vid/${TOUR_MEDIA}/${o}/intro.mp4`,
  trips: [1, 2, 3, 4, 5].map((i) => `/vid/${TOUR_MEDIA}/${o}/t${i}.mp4`),
  rests: scenes.map((s) => `/img/${TOUR_MEDIA}/${o}/rest-${s.id}.webp`),
});
