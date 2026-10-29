import type { Locale } from "../types";

// The projects segment is translated: /es/proyectos and /en/projects (one route folder per language in src/app/[lang]).
export const projectsSegment = { es: "proyectos", en: "projects" } as const satisfies Record<Locale, string>;

export const projectsPath = (lang: Locale, slug?: string) =>
  `/${lang}/${projectsSegment[lang]}${slug ? `/${slug}` : ""}`;
