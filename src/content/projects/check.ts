import { existsSync } from "node:fs";
import { join } from "node:path";
import { locales } from "../types";
import { projects, shotFile, type Device } from "./index";

// Runs at build time (generateStaticParams of the project pages and the sitemap): a project with a missing language,
// a missing screenshot or a repeated slug fails the build instead of publishing a half finished page.
export function checkProjects() {
  const problems: string[] = [];
  const slugs = new Set<string>();

  for (const project of projects) {
    const at = `projects/${project.slug}`;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(project.slug)) problems.push(`${at}: slug must be lowercase words joined by hyphens`);
    if (slugs.has(project.slug)) problems.push(`${at}: repeated slug`);
    slugs.add(project.slug);
    if (project.media.shots.length === 0) problems.push(`${at}: needs at least one screenshot`);

    for (const lang of locales) {
      const copy = project.copy[lang];
      for (const [field, value] of Object.entries(copy)) {
        const empty = Array.isArray(value) ? value.length === 0 : !String(value).trim();
        if (empty) problems.push(`${at}: copy.${lang}.${field} is empty`);
      }
      for (const shot of project.media.shots) {
        if (!shot.alt[lang]?.trim()) problems.push(`${at}: shot "${shot.name}" has no ${lang} alt text`);
      }
    }

    for (const shot of project.media.shots) {
      for (const device of ["desktop", "mobile"] satisfies Device[]) {
        // Literal folder prefix: the build traces only public/img/projects, not the whole public folder (videos).
        const file = join(
          process.cwd(),
          "public/img/projects",
          project.slug,
          project.media.version,
          shotFile(shot.name, device),
        );
        if (!existsSync(file)) problems.push(`${at}: missing ${file}`);
      }
    }
  }

  if (problems.length) throw new Error(`Projects are incomplete:\n- ${problems.join("\n- ")}`);
}
