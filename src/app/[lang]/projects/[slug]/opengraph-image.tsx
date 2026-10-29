import { notFound } from "next/navigation";
import { ogContentType, ogSize, renderProjectOg } from "@/components/projects/og";
import { projects } from "@/content/projects";

const LANG = "en";

export const alt = "Project by Germán Flores";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const jpeg = await renderProjectOg(LANG, slug);
  if (!jpeg) notFound();
  return new Response(new Uint8Array(Buffer.from(jpeg, "base64")), {
    headers: { "Content-Type": contentType },
  });
}
