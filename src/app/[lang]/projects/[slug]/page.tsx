import { notFound } from "next/navigation";
import { projectMetadata, ProjectPage } from "@/components/projects/pages";
import { getProject, projects } from "@/content/projects";
import { checkProjects } from "@/content/projects/check";

// One project page in one language; the other language has its own segment (src/content/projects/paths.ts).
const LANG = "en";

export function generateStaticParams() {
  checkProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/projects/[slug]">) {
  const { lang, slug } = await params;
  return lang === LANG ? projectMetadata(LANG, slug) : {};
}

export default async function Page({ params }: PageProps<"/[lang]/projects/[slug]">) {
  const { lang, slug } = await params;
  const project = getProject(slug);
  if (lang !== LANG || !project) notFound();
  return <ProjectPage lang={LANG} project={project} />;
}
