// Language independent data: contact links, media paths, pacing and accents of the flight.
export const site = {
  name: "German Flores",
  url: "https://germanflores.dev", // placeholder until the final domain is decided
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

// Desktop chain is 16:9 at 1080p; the phone chain is a native 9:16 render at 720 wide (`-m` files).
// The engine picks the `-m` sources on phones and coarse pointers.
export const sceneAssets = (id: SceneId) => ({
  still: `/img/scenes/${id}.webp`,
  clip: `/vid/${id}.mp4`,
  stillMobile: `/img/scenes/${id}-m.webp`,
  clipMobile: `/vid/${id}-m.mp4`,
});

export const connectors = [1, 2, 3, 4, 5].map((i) => `/vid/conn${i}.mp4`);
export const connectorsMobile = [1, 2, 3, 4, 5].map((i) => `/vid/conn${i}-m.mp4`);
