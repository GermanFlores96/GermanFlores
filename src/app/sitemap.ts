import type { MetadataRoute } from "next";
import { projects, projectsPath } from "@/content/projects";
import { checkProjects } from "@/content/projects/check";
import { site } from "@/content/shared";
import { locales, type Locale } from "@/content/types";

export default function sitemap(): MetadataRoute.Sitemap {
  checkProjects();
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? site.url;

  // One entry per language of each page, every entry listing all its language versions.
  const page = (path: (lang: Locale) => string, lastModified: string, xDefault?: string) =>
    locales.map((lang) => ({
      url: `${base}${path(lang)}`,
      lastModified,
      alternates: {
        languages: {
          ...Object.fromEntries(locales.map((l) => [l, `${base}${path(l)}`])),
          ...(xDefault ? { "x-default": xDefault } : {}),
        },
      },
    }));

  const newestProject = projects.map((p) => p.updated).sort().at(-1) ?? site.updated;
  return [
    ...page((lang) => `/${lang}`, site.updated, base),
    ...page((lang) => projectsPath(lang), newestProject),
    ...projects.flatMap((project) => page((lang) => projectsPath(lang, project.slug), project.updated)),
  ];
}
