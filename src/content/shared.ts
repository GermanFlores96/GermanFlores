// Language independent data: contact links, media paths, pacing and accents of the flight.
export const site = {
  name: "German Flores",
  url: "https://germanflores.dev",
  legacyHost: "germanflores.vercel.app", // first address of the site: redirects here (src/proxy.ts)
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

// Phone chapter media (native 9:16), built by sw-work/scripts/build_tour.py. Same immutable cache rule as MEDIA:
// a change means a new folder. v5 = 6 s trips with returns, gentle acceleration, a keyframe every 4 frames (they
// follow the finger). v2 to v4 stay published but unused.
const TOUR_MEDIA = "v5";
const base = `/vid/${TOUR_MEDIA}/m`;

// trips[k]: chapter k -> k + 1; backs[k]: chapter k + 1 -> k (the same frames in reverse).
export const tourAssets = {
  start: `/img/${TOUR_MEDIA}/m/start.webp`,
  intro: `${base}/intro.mp4`,
  trips: [1, 2, 3, 4, 5].map((i) => `${base}/t${i}.mp4`),
  backs: [1, 2, 3, 4, 5].map((i) => `${base}/r${i}.mp4`),
  rests: scenes.map((s) => `/img/${TOUR_MEDIA}/m/rest-${s.id}.webp`),
};
