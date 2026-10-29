import type { Locale } from "../types";

export type ProjectStatus = "live" | "beta" | "building";
export type ProjectKind = "client" | "own";

// Production projects keep their code private; the page says so instead of hiding it.
export type ProjectCode = { visibility: "private" } | { visibility: "public"; repo: string };

// Texts of one project in one language. `results` style claims stay qualitative unless a number is real and approved.
export type ProjectCopy = {
  name: string;
  // Short category: card kicker and page title ("Tienda online de maquillaje").
  kicker: string;
  // One sentence under the name.
  tagline: string;
  // Card text: two lines at most.
  summary: string;
  // Meta description: around 150 characters, with the author's name.
  description: string;
  problem: string;
  role: string;
  work: string[];
  decisions: { title: string; body: string }[];
  result: string;
};

export type Project = {
  slug: string; // the same URL in both languages: /es/proyectos/<slug>, /en/projects/<slug>
  order: number;
  featured: boolean; // shown on the home page
  status: ProjectStatus;
  kind: ProjectKind;
  year: number;
  updated: string; // last change of this page's content (sitemap), YYYY-MM-DD
  url: string;
  code: ProjectCode;
  stack: string[];
  // Screenshots from sw-work/scripts/capturar_proyecto.mjs: public/img/projects/<slug>/<version>/<name>-escritorio.webp
  // and <name>-movil.webp. The first shot is the cover. A new set of screenshots goes to a new version folder.
  media: {
    version: string;
    shots: { name: string; alt: Record<Locale, string> }[];
  };
  copy: Record<Locale, ProjectCopy>;
};
