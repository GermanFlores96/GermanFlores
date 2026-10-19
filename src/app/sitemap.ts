import type { MetadataRoute } from "next";
import { site } from "@/content/shared";
import { locales } from "@/content/types";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? site.url;
  return locales.map((lang) => ({
    url: `${base}/${lang}`,
    lastModified: site.updated,
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, `${base}/${l}`])),
    },
  }));
}
