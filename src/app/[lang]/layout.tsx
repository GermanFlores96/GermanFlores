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
      languages: { es: "/es", en: "/en", "x-default": "/es" },
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
  const { meta, nav, career } = getDictionary(lang);

  // A profile page about one person (schema.org ProfilePage, as Google recommends for personal sites).
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? site.url;
  const person = {
    "@type": "Person",
    "@id": `${base}/#person`,
    name: site.name,
    alternateName: site.alternateName,
    url: base,
    image: `${base}${site.photo}`,
    jobTitle: nav.brandRole,
    description: meta.description,
    email: `mailto:${site.email}`,
    sameAs: [site.linkedin],
    address: { "@type": "PostalAddress", addressLocality: "Caracas", addressCountry: "VE" },
    alumniOf: career.education.map((e) => ({ "@type": "EducationalOrganization", name: e.school })),
    knowsAbout: site.knowsAbout,
  };
  const profile = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${base}/${lang}`,
    name: meta.title,
    inLanguage: lang,
    dateModified: site.updated,
    mainEntity: person,
  };

  return (
    <html lang={lang} className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <body className="bg-bg text-ink min-h-dvh font-sans">
        {children}
        <VersionCheck />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(profile) }}
        />
      </body>
    </html>
  );
}
