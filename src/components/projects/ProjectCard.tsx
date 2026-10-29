import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/ssr";
import { projectsPath, shotSize, shotSrc, type Project } from "@/content/projects";
import type { Dictionary, Locale } from "@/content/types";

type ProjectsCopy = Dictionary["projects"];

const statusColor = { live: "text-mint", beta: "text-cyan", building: "text-violet-soft" } as const;
const statusDot = { live: "bg-mint", beta: "bg-cyan", building: "bg-violet-soft" } as const;

export function StatusBadge({ project, copy }: { project: Project; copy: ProjectsCopy }) {
  return (
    <span className={`flex items-center gap-2 text-sm font-semibold ${statusColor[project.status]}`}>
      <span className={`size-2 rounded-full ${statusDot[project.status]}`} aria-hidden />
      {copy.statuses[project.status]}
    </span>
  );
}

// A screenshot pair: the desktop view, with the phone view laid over its lower right corner from `sm` up.
// `radius` is the desktop image's corner, which depends on the frame it sits in.
export function Showcase({
  project,
  shot,
  lang,
  copy,
  priority = false,
  radius = "rounded-lg",
}: {
  project: Project;
  shot: Project["media"]["shots"][number];
  lang: Locale;
  copy: ProjectsCopy;
  priority?: boolean;
  radius?: string;
}) {
  return (
    <div className="relative">
      <Image
        src={shotSrc(project, shot.name, "desktop")}
        alt={`${shot.alt[lang]}, ${copy.devices.desktop}`}
        {...shotSize.desktop}
        priority={priority}
        className={`aspect-[16/10] w-full object-cover ${radius}`}
      />
      <Image
        src={shotSrc(project, shot.name, "mobile")}
        alt={`${shot.alt[lang]}, ${copy.devices.mobile}`}
        {...shotSize.mobile}
        priority={priority}
        className="border-line absolute right-4 bottom-4 hidden w-1/5 rounded-xl border shadow-2xl shadow-black/50 sm:block"
      />
    </div>
  );
}

// `wide`: screenshot and text side by side on large screens (home page). `stacked`: screenshot above (index grid).
export function ProjectCard({
  project,
  lang,
  copy,
  layout,
  heading: Heading,
}: {
  project: Project;
  lang: Locale;
  copy: ProjectsCopy;
  layout: "wide" | "stacked";
  heading: "h2" | "h3";
}) {
  const text = project.copy[lang];
  const href = projectsPath(lang, project.slug);
  const host = new URL(project.url).host;

  return (
    <article
      className={`border-line bg-surface flex w-full flex-col rounded-2xl border p-2 ${
        layout === "wide" ? "lg:grid lg:grid-cols-[3fr_2fr] lg:items-center" : ""
      }`}
    >
      {/* The screenshot repeats the title link for pointer users; screen readers and the keyboard get it once. */}
      <Link href={href} tabIndex={-1} aria-hidden className="group block overflow-hidden rounded-lg">
        <div className="transition-all duration-700 ease-fluid group-hover:scale-[1.02]">
          <Showcase project={project} shot={project.media.shots[0]} lang={lang} copy={copy} />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <StatusBadge project={project} copy={copy} />
          <span className="text-muted text-sm">
            {copy.kinds[project.kind]} · {project.year}
          </span>
        </div>

        <header>
          <p className="text-cyan text-sm font-semibold">{text.kicker}</p>
          <Heading className="mt-2 text-3xl leading-9 font-semibold tracking-tight">
            <Link href={href} className="hover:text-violet-soft transition-all duration-700 ease-fluid">
              {text.name}
            </Link>
          </Heading>
          <p className="text-muted mt-4 text-base">{text.summary}</p>
        </header>

        <ul className="flex flex-wrap gap-2">
          {project.stack.slice(0, 6).map((tag) => (
            <li key={tag} className="border-line text-muted rounded-full border px-3 py-1 text-xs">
              {tag}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-wrap items-center gap-4">
          <Link
            href={href}
            className="bg-violet hover:bg-violet-soft inline-flex min-h-12 items-center gap-2 rounded-lg px-3 py-2 text-base font-semibold text-white transition-all duration-700 ease-fluid hover:-translate-y-0.5 active:scale-[0.98]"
          >
            {copy.open}
            <ArrowRight size={16} weight="bold" aria-hidden />
          </Link>
          <a
            href={project.url}
            target="_blank"
            rel="noopener"
            className="text-muted hover:text-ink inline-flex min-h-12 items-center gap-1 text-base font-semibold transition-all duration-700 ease-fluid"
          >
            {copy.visit} {host}
            <ArrowUpRight size={16} weight="bold" aria-hidden />
          </a>
        </div>
      </div>
    </article>
  );
}
