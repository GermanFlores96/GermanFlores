import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { VersionCheck } from "@/components/VersionCheck";
import { getDictionary } from "@/content/dictionaries";
import { site } from "@/content/shared";
import { hasLocale, locales } from "@/content/types";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: "#0f1428",
  viewportFit: "cover",
};

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { meta } = getDictionary(lang);

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? site.url),
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `/${lang}`,
      // x-default is the root: it redirects each visitor to their language (src/proxy.ts).
      languages: { es: "/es", en: "/en", "x-default": "/" },
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      title: meta.title,
      description: meta.description,
      url: `/${lang}`,
      locale: meta.ogLocale,
      // og:image comes from opengraph-image.tsx next to this layout (one per language, with name and role).
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  // Structured data lives in each page (src/content/structured-data.ts): the home page is a ProfilePage, project
  // pages describe a work.
  return (
    <html lang={lang} className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <body className="bg-bg text-ink min-h-dvh font-sans">
        {children}
        <VersionCheck />
      </body>
    </html>
  );
}
