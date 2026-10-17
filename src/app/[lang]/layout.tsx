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
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: meta.ogAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: ["/og-image.jpg"],
    },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { meta } = getDictionary(lang);

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: "Senior Mobile Engineer",
    description: meta.description,
    email: `mailto:${site.email}`,
    sameAs: [site.linkedin],
    address: { "@type": "PostalAddress", addressLocality: "Caracas", addressCountry: "VE" },
  };

  return (
    <html lang={lang} className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <body className="bg-bg text-ink min-h-dvh font-sans">
        {children}
        <VersionCheck />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
        />
      </body>
    </html>
  );
}
