import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getDictionary } from "@/content/dictionaries";
import { palette, site } from "@/content/shared";
import { hasLocale, locales } from "@/content/types";

// The share image (LinkedIn, WhatsApp, X...): the diorama with the name and role on it, one per language, built at
// compile time. Without text, a shared link showed a picture and nothing saying whose site it was.
export const alt = `${site.name} · Senior Software Engineer`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

// Cached file reads: without them the image counts as uncached data and is rendered again on every request.
// Literal paths, so the bundler traces exactly these files (a computed path made it trace the whole project).
async function assets() {
  "use cache";
  const [background, semibold, medium] = await Promise.all([
    readFile(join(process.cwd(), "public/og-image.jpg")),
    readFile(
      join(
        process.cwd(),
        "node_modules/geist/dist/fonts/geist-sans/Geist-SemiBold.ttf",
      ),
    ),
    readFile(
      join(
        process.cwd(),
        "node_modules/geist/dist/fonts/geist-sans/Geist-Medium.ttf",
      ),
    ),
  ]);
  return {
    background: background.toString("base64"),
    semibold: semibold.toString("base64"),
    medium: medium.toString("base64"),
  };
}

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const { meta, nav } = getDictionary(hasLocale(lang) ? lang : "es");
  const files = await assets();

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        position: "relative",
        background: palette.bg,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- rendered by next/og, not the browser */}
      <img
        src={`data:image/jpeg;base64,${files.background}`}
        width={1200}
        height={630}
        alt=""
        style={{ position: "absolute", left: 0, top: 0 }}
      />
      {/* next/og has no `inset`: explicit box. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1200,
          height: 630,
          background: `linear-gradient(180deg, rgba(15,20,40,0) 38%, rgba(15,20,40,0.82) 68%, ${palette.bg} 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 64,
          right: 64,
          bottom: 52,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 600,
              color: "#ffffff",
              letterSpacing: -2,
              lineHeight: 1,
            }}
          >
            {site.name}
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 34,
              color: palette.ink,
              lineHeight: 1.2,
            }}
          >
            {`${nav.brandRole} · ${meta.ogLine}`}
          </div>
        </div>
        <div style={{ fontSize: 26, color: "#9B87FF", lineHeight: 1.2 }}>
          {new URL(site.url).host}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Geist",
          data: Buffer.from(files.semibold, "base64"),
          weight: 600,
          style: "normal",
        },
        {
          name: "Geist",
          data: Buffer.from(files.medium, "base64"),
          weight: 500,
          style: "normal",
        },
      ],
    },
  );
}
