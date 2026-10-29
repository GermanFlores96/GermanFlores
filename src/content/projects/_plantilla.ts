import type { Project } from "./types";

// Template for a new project (PLAN_PROYECTOS.md, phase 2):
//   1. node sw-work/scripts/capturar_proyecto.mjs <url> <slug> v1 /:inicio /otra-ruta:nombre
//   2. Copy this file to <slug>.ts, rename the constant, fill both languages and add it to `all` in index.ts.
//   3. npm run build: it fails if a language, a screenshot or a unique slug is missing.
// This file is not registered, so it never reaches the site.
export const plantilla: Project = {
  slug: "slug-del-proyecto",
  order: 99,
  featured: false,
  status: "live",
  kind: "own",
  year: 2026,
  updated: "2026-01-01",
  url: "https://ejemplo.dev",
  code: { visibility: "private" },
  stack: ["Next.js"],
  media: {
    version: "v1",
    shots: [{ name: "inicio", alt: { es: "Qué se ve en la captura", en: "What the screenshot shows" } }],
  },
  copy: {
    es: {
      name: "",
      kicker: "",
      tagline: "",
      summary: "",
      description: "",
      problem: "",
      role: "",
      work: [],
      decisions: [],
      result: "",
    },
    en: {
      name: "",
      kicker: "",
      tagline: "",
      summary: "",
      description: "",
      problem: "",
      role: "",
      work: [],
      decisions: [],
      result: "",
    },
  },
};
