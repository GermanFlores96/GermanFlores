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
  const { meta, nav, career } = getDictionary(lang);

  // One graph: the site (its name is what search engines show for the domain), a profile page about one person
  // (schema.org ProfilePage, as Google recommends for personal sites) and that person, linked by @id.
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? site.url;
  const website = {
    "@type": "WebSite",
    "@id": `${base}/#website`,
    url: base,
    name: site.name,
    alternateName: [site.alternateName, "germanflores.dev"],
    inLanguage: locales,
    publisher: { "@id": `${base}/#person` },
  };
  const person = {
    "@type": "Person",
    "@id": `${base}/#person`,
    name: site.name,
    givenName: "Germán",
    familyName: "Flores",
    alternateName: site.alternateName,
    url: base,
    mainEntityOfPage: `${base}/${lang}`,
    image: { "@type": "ImageObject", url: `${base}${site.photo}`, width: 960, height: 1200 },
    jobTitle: nav.brandRole,
    description: meta.description,
    email: `mailto:${site.email}`,
    sameAs: site.profiles,
    address: { "@type": "PostalAddress", addressLocality: "Caracas", addressCountry: "VE" },
    alumniOf: career.education.map((e) => ({ "@type": "EducationalOrganization", name: e.school })),
    knowsAbout: site.knowsAbout,
  };
  const profile = {
    "@type": "ProfilePage",
    "@id": `${base}/${lang}#profile`,
    url: `${base}/${lang}`,
    name: meta.title,
    inLanguage: lang,
    // Google wants a full ISO 8601 date and time with offset; a bare date is flagged as invalid (Caracas is UTC-4).
    dateModified: `${site.updated}T00:00:00-04:00`,
    isPartOf: { "@id": `${base}/#website` },
    mainEntity: { "@id": `${base}/#person` },
  };
  const graph = { "@context": "https://schema.org", "@graph": [website, profile, person] };

  return (
    <html lang={lang} className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <body className="bg-bg text-ink min-h-dvh font-sans">
        {children}
        <VersionCheck />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
        />
      </body>
    </html>
  );
}
