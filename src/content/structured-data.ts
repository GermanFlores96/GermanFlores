import { getDictionary } from "./dictionaries";
import { site } from "./shared";
import { locales, type Locale } from "./types";

// Shared schema.org nodes. Every page repeats the site and the person with the same @id, so each page's graph stands
// on its own and search engines tie them together: the home page is the person's ProfilePage, project pages are works
// whose creator is that person.
export const siteBase = () => process.env.NEXT_PUBLIC_SITE_URL ?? site.url;

export function websiteNode() {
  const base = siteBase();
  return {
    "@type": "WebSite",
    "@id": `${base}/#website`,
    url: base,
    name: site.name,
    alternateName: [site.alternateName, "germanflores.dev"],
    inLanguage: locales,
    publisher: { "@id": `${base}/#person` },
  };
}

export function personNode(lang: Locale) {
  const base = siteBase();
  const { meta, nav, career } = getDictionary(lang);
  return {
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
}

export function breadcrumbNode(id: string, items: { name: string; url: string }[]) {
  return {
    "@type": "BreadcrumbList",
    "@id": id,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export const graph = (nodes: object[]) => JSON.stringify({ "@context": "https://schema.org", "@graph": nodes });
