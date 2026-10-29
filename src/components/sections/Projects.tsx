import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Reveal } from "@/components/ui/Reveal";
import { featuredProjects, projectsPath } from "@/content/projects";
import type { Dictionary, Locale } from "@/content/types";

// Home page section: the featured projects, one wide card each, and the way to the full list.
export function Projects({ lang, copy }: { lang: Locale; copy: Dictionary["projects"] }) {
  if (featuredProjects.length === 0) return null;

  return (
    <section id="proyectos" className="scroll-mt-24 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-violet-soft text-sm font-semibold">{copy.eyebrow}</p>
          <h2 className="mt-2 max-w-[680px] text-4xl leading-10 font-semibold tracking-tight md:text-5xl md:leading-none">
            {copy.title}
          </h2>
          <p className="text-muted mt-4 max-w-[680px] text-lg">{copy.intro}</p>
        </Reveal>

        <ul className="mt-16 flex flex-col gap-6">
          {featuredProjects.map((project, i) => (
            <li key={project.slug} className="flex">
              <Reveal delay={i * 100} className="flex w-full">
                <ProjectCard project={project} lang={lang} copy={copy} layout="wide" heading="h3" />
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal className="mt-8">
          <Link
            href={projectsPath(lang)}
            className="text-violet-soft hover:text-ink inline-flex min-h-11 items-center gap-2 text-base font-semibold transition-all duration-700 ease-fluid"
          >
            {copy.all}
            <ArrowRight size={16} weight="bold" aria-hidden />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
