import { notFound } from "next/navigation";
import { projectsIndexMetadata, ProjectsIndexPage } from "@/components/projects/pages";

// Projects index in one language; the other language has its own segment (src/content/projects/paths.ts).
const LANG = "en";

export async function generateMetadata({ params }: PageProps<"/[lang]/projects">) {
  const { lang } = await params;
  return lang === LANG ? projectsIndexMetadata(LANG) : {};
}

export default async function Page({ params }: PageProps<"/[lang]/projects">) {
  const { lang } = await params;
  if (lang !== LANG) notFound();
  return <ProjectsIndexPage lang={LANG} />;
}
