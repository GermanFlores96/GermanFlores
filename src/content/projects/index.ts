import { blushing } from "./blushing";
import type { Project } from "./types";

export type { Project, ProjectCopy, ProjectKind, ProjectStatus } from "./types";
export { projectsPath, projectsSegment } from "./paths";

// Every published project. A new one is a new file in this folder plus one entry here (see _plantilla.ts).
const all: Project[] = [blushing];

export const projects = [...all].sort((a, b) => a.order - b.order);
export const featuredProjects = projects.filter((project) => project.featured);

export const getProject = (slug: string) => projects.find((project) => project.slug === slug);

// Screenshot sizes from sw-work/scripts/capturar_proyecto.mjs.
export const shotSize = {
  desktop: { width: 1600, height: 1000 },
  mobile: { width: 780, height: 1688 },
} as const;

export type Device = keyof typeof shotSize;

export const shotFile = (name: string, device: Device) =>
  `${name}-${device === "desktop" ? "escritorio" : "movil"}.webp`;

export const shotSrc = (project: Project, name: string, device: Device) =>
  `/img/projects/${project.slug}/${project.media.version}/${shotFile(name, device)}`;

// Previous and next project in the published order, wrapping around; none when there is only one.
export function projectNeighbors(slug: string) {
  const i = projects.findIndex((project) => project.slug === slug);
  if (i === -1 || projects.length < 2) return null;
  return {
    prev: projects[(i - 1 + projects.length) % projects.length],
    next: projects[(i + 1) % projects.length],
  };
}
