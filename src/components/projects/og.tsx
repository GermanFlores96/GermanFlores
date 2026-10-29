import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { getDictionary } from "@/content/dictionaries";
import { getProject, shotFile } from "@/content/projects";
import { palette, site } from "@/content/shared";
import type { Locale } from "@/content/types";

// Share image of a project page: name and category on the left, the cover screenshots (desktop and phone) on the
// right. Built at compile time, like the home page's (src/app/[lang]/opengraph-image.tsx).
export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/jpeg";

async function fonts() {
  "use cache";
  const [semibold, medium] = await Promise.all([
    readFile(join(process.cwd(), "node_modules/geist/dist/fonts/geist-sans/Geist-SemiBold.ttf")),
    readFile(join(process.cwd(), "node_modules/geist/dist/fonts/geist-sans/Geist-Medium.ttf")),
  ]);
  return { semibold: semibold.toString("base64"), medium: medium.toString("base64") };
}

// next/og does not read WebP: the screenshots go in as JPEG. Literal folder prefix so the build only traces
// public/img/projects.
async function screenshot(slug: string, version: string, file: string, width: number) {
  const webp = await readFile(join(process.cwd(), "public/img/projects", slug, version, file));
  const jpeg = await sharp(webp).resize({ width }).jpeg({ quality: 86 }).toBuffer();
  return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
}

export async function renderProjectOg(lang: Locale, slug: string) {
  "use cache";
  const project = getProject(slug);
  if (!project) return null;
  const copy = project.copy[lang];
  const { projects } = getDictionary(lang);
  const cover = project.media.shots[0].name;
  const [files, desktop, mobile] = await Promise.all([
    fonts(),
    screenshot(project.slug, project.media.version, shotFile(cover, "desktop"), 1440),
    screenshot(project.slug, project.media.version, shotFile(cover, "mobile"), 360),
  ]);

  const png = new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", position: "relative", background: palette.bg }}>
      {/* The desktop screenshot runs off the right edge on purpose: it reads as a window, not as a thumbnail. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- rendered by next/og, not the browser */}
      <img
        src={desktop}
        width={720}
        height={450}
        alt=""
        style={{
          position: "absolute",
          left: 560,
          top: 90,
          borderRadius: 16,
          border: "2px solid rgba(232,236,245,0.16)",
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- rendered by next/og, not the browser */}
      <img
        src={mobile}
        width={170}
        height={368}
        alt=""
        style={{
          position: "absolute",
          left: 470,
          top: 200,
          borderRadius: 24,
          border: "2px solid rgba(232,236,245,0.16)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.45)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 64,
          bottom: 56,
          width: 400,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Separate boxes: next/og spaced the words unevenly when the dot shared a text run with them. */}
          <div style={{ display: "flex", gap: 12, fontSize: 26, color: "#9B87FF", lineHeight: 1.2 }}>
            <span>{projects.eyebrow}</span>
            <span>·</span>
            <span>{site.name}</span>
          </div>
          <div
            style={{
              marginTop: 32,
              fontSize: 84,
              fontWeight: 600,
              color: "#ffffff",
              letterSpacing: -2,
              lineHeight: 1,
            }}
          >
            {copy.name}
          </div>
          <div style={{ marginTop: 24, fontSize: 34, color: palette.ink, lineHeight: 1.2 }}>{copy.kicker}</div>
        </div>
        <div style={{ fontSize: 26, color: "#9aa6c2", lineHeight: 1.2 }}>{new URL(project.url).host}</div>
      </div>
    </div>,
    {
      ...ogSize,
      fonts: [
        { name: "Geist", data: Buffer.from(files.semibold, "base64"), weight: 600, style: "normal" },
        { name: "Geist", data: Buffer.from(files.medium, "base64"), weight: 500, style: "normal" },
      ],
    },
  );
  const jpeg = await sharp(Buffer.from(await png.arrayBuffer()))
    .jpeg({ quality: 84, mozjpeg: true })
    .toBuffer();
  return jpeg.toString("base64");
}
