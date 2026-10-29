import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
  GithubLogo,
  LockSimple,
} from "@phosphor-icons/react/ssr";
import { SiteNav } from "@/components/SiteNav";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { Reveal } from "@/components/ui/Reveal";
import { getDictionary } from "@/content/dictionaries";
import {
  getProject,
  projectNeighbors,
  projects,
  projectsPath,
  shotSize,
  shotSrc,
  type Project,
} from "@/content/projects";
import { site } from "@/content/shared";
import { breadcrumbNode, graph, personNode, siteBase, websiteNode } from "@/content/structured-data";
import type { Locale } from "@/content/types";
import { ProjectCard, Showcase, StatusBadge } from "./ProjectCard";

const otherLang = (lang: Locale): Locale => (lang === "es" ? "en" : "es");

// ---------------------------------------------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------------------------------------------

export function projectsIndexMetadata(lang: Locale): Metadata {
  const { projects: copy, meta } = getDictionary(lang);
  const url = projectsPath(lang);
  return {
    title: copy.index.metaTitle,
    description: copy.index.metaDescription,
    alternates: {
      canonical: url,
      languages: { es: projectsPath("es"), en: projectsPath("en") },
    },
    // og:image is the home page's share image (src/app/[lang]/opengraph-image.tsx).
    openGraph: {
      type: "website",
      siteName: site.name,
      title: copy.index.metaTitle,
      description: copy.index.metaDescription,
      url,
      locale: meta.ogLocale,
    },
    twitter: { card: "summary_large_image", title: copy.index.metaTitle, description: copy.index.metaDescription },
  };
}

export function projectMetadata(lang: Locale, slug: string): Metadata {
  const project = getProject(slug);
  if (!project) return {};
  const { meta } = getDictionary(lang);
  const text = project.copy[lang];
  const title = `${text.name} · ${text.kicker} · ${site.name}`;
  const url = projectsPath(lang, slug);
  return {
    title,
    description: text.description,
    alternates: {
      canonical: url,
      languages: { es: projectsPath("es", slug), en: projectsPath("en", slug) },
    },
    // og:image comes from opengraph-image.tsx in the project's route folder.
    openGraph: {
      type: "article",
      siteName: site.name,
      title,
      description: text.description,
      url,
      locale: meta.ogLocale,
    },
    twitter: { card: "summary_large_image", title, description: text.description },
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Shared page chrome
// ---------------------------------------------------------------------------------------------------------------

function PageNav({ lang, alternate }: { lang: Locale; alternate: string }) {
  const dict = getDictionary(lang);
  return (
    <SiteNav
      lang={lang}
      name={site.name}
      role={dict.nav.brandRole}
      links={dict.nav.links}
      cta={dict.nav.cta}
      email={site.email}
      openMenu={dict.nav.openMenu}
      closeMenu={dict.nav.closeMenu}
      languageLabel={dict.nav.language}
      skip={dict.nav.skip}
      base={`/${lang}`}
      alternate={alternate}
      current="proyectos"
    />
  );
}

function Breadcrumb({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="text-muted flex flex-wrap items-center gap-2 text-sm">
        {items.map((item, i) => (
          <li key={item.name} className="flex items-center gap-2">
            {i > 0 ? <span aria-hidden>/</span> : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-ink transition-all duration-700 ease-fluid">
                {item.name}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

const headingGradient = "bg-linear-to-r from-white to-[#9b9b9b] bg-clip-text text-transparent";

// ---------------------------------------------------------------------------------------------------------------
// /es/proyectos · /en/projects
// ---------------------------------------------------------------------------------------------------------------

export function ProjectsIndexPage({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const copy = dict.projects;
  const base = siteBase();
  const url = `${base}${projectsPath(lang)}`;
  const crumbs = [
    { name: copy.home, url: `${base}/${lang}` },
    { name: copy.eyebrow, url },
  ];
  const nodes = [
    websiteNode(),
    personNode(lang),
    {
      "@type": "CollectionPage",
      "@id": `${url}#page`,
      url,
      name: copy.index.metaTitle,
      description: copy.index.metaDescription,
      inLanguage: lang,
      isPartOf: { "@id": `${base}/#website` },
      about: { "@id": `${base}/#person` },
      breadcrumb: { "@id": `${url}#breadcrumb` },
      mainEntity: {
        "@type": "ItemList",
        itemListElement: projects.map((project, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${base}${projectsPath(lang, project.slug)}`,
          name: project.copy[lang].name,
        })),
      },
    },
    breadcrumbNode(`${url}#breadcrumb`, crumbs),
  ];

  return (
    <>
      <PageNav lang={lang} alternate={projectsPath(otherLang(lang))} />
      <main id="top" className="pt-32 md:pt-40">
        <div className="mx-auto max-w-6xl px-6">
          <Breadcrumb items={[{ name: copy.home, href: `/${lang}` }, { name: copy.eyebrow }]} />
          <Reveal>
            <h1 className={`mt-8 max-w-[680px] text-5xl font-semibold tracking-tight md:text-7xl ${headingGradient}`}>
              {copy.index.title}
            </h1>
            <p className="text-muted mt-6 max-w-[680px] text-lg">{copy.index.intro}</p>
          </Reveal>

          <ul className={`mt-16 grid gap-6 ${projects.length > 1 ? "lg:grid-cols-2" : ""}`}>
            {projects.map((project, i) => (
              <li key={project.slug} className="flex">
                <Reveal delay={i * 100} className="flex w-full">
                  <ProjectCard
                    project={project}
                    lang={lang}
                    copy={copy}
                    layout={projects.length > 1 ? "stacked" : "wide"}
                    heading="h2"
                  />
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
        <Contact copy={dict.contact} />
      </main>
      <Footer lang={lang} copy={dict.footer} alternate={projectsPath(otherLang(lang))} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: graph(nodes) }} />
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// /es/proyectos/<slug> · /en/projects/<slug>
// ---------------------------------------------------------------------------------------------------------------

function projectGraph(project: Project, lang: Locale) {
  const { projects: copy } = getDictionary(lang);
  const text = project.copy[lang];
  const base = siteBase();
  const url = `${base}${projectsPath(lang, project.slug)}`;
  const cover = `${base}${shotSrc(project, project.media.shots[0].name, "desktop")}`;
  return [
    websiteNode(),
    personNode(lang),
    {
      "@type": "WebPage",
      "@id": `${url}#page`,
      url,
      name: `${text.name} · ${text.kicker}`,
      description: text.description,
      inLanguage: lang,
      isPartOf: { "@id": `${base}/#website` },
      breadcrumb: { "@id": `${url}#breadcrumb` },
      mainEntity: { "@id": `${url}#work` },
      primaryImageOfPage: cover,
      // Same rule as the home page: full ISO 8601 date and time with the Caracas offset.
      dateModified: `${project.updated}T00:00:00-04:00`,
    },
    {
      "@type": "CreativeWork",
      "@id": `${url}#work`,
      name: text.name,
      description: text.tagline,
      url: project.url,
      image: cover,
      inLanguage: lang,
      dateCreated: String(project.year),
      creator: { "@id": `${base}/#person` },
      keywords: project.stack,
      genre: text.kicker,
      ...(project.code.visibility === "public" ? { codeRepository: project.code.repo } : {}),
    },
    breadcrumbNode(`${url}#breadcrumb`, [
      { name: copy.home, url: `${base}/${lang}` },
      { name: copy.eyebrow, url: `${base}${projectsPath(lang)}` },
      { name: text.name, url },
    ]),
  ];
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal>
      <section>
        <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
        <div className="mt-6">{children}</div>
      </section>
    </Reveal>
  );
}

export function ProjectPage({ lang, project }: { lang: Locale; project: Project }) {
  const dict = getDictionary(lang);
  const copy = dict.projects;
  const text = project.copy[lang];
  const host = new URL(project.url).host;
  const alternate = projectsPath(otherLang(lang), project.slug);
  const neighbors = projectNeighbors(project.slug);
  const [cover, ...gallery] = project.media.shots;

  const facts: { label: string; value: React.ReactNode }[] = [
    { label: copy.labels.role, value: text.role },
    { label: copy.labels.type, value: copy.kinds[project.kind] },
    { label: copy.labels.year, value: project.year },
    { label: copy.labels.status, value: <StatusBadge project={project} copy={copy} /> },
    {
      label: copy.labels.site,
      value: (
        <a
          href={project.url}
          target="_blank"
          rel="noopener"
          className="text-violet-soft hover:text-ink inline-flex items-center gap-1 font-semibold transition-all duration-700 ease-fluid"
        >
          {host}
          <ArrowUpRight size={16} weight="bold" aria-hidden />
        </a>
      ),
    },
    {
      label: copy.labels.code,
      value:
        project.code.visibility === "public" ? (
          <a
            href={project.code.repo}
            target="_blank"
            rel="noopener"
            className="text-violet-soft hover:text-ink inline-flex items-center gap-1 font-semibold transition-all duration-700 ease-fluid"
          >
            <GithubLogo size={16} aria-hidden />
            {copy.code.public}
          </a>
        ) : (
          <span className="inline-flex items-center gap-2">
            <LockSimple size={16} aria-hidden className="text-muted shrink-0" />
            {copy.code.private}
          </span>
        ),
    },
  ];

  return (
    <>
      <PageNav lang={lang} alternate={alternate} />
      <main id="top" className="pt-32 md:pt-40">
        <article className="mx-auto max-w-6xl px-6">
          <Breadcrumb
            items={[
              { name: copy.home, href: `/${lang}` },
              { name: copy.eyebrow, href: projectsPath(lang) },
              { name: text.name },
            ]}
          />

          <Reveal>
            <header className="mt-8">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <StatusBadge project={project} copy={copy} />
                <span className="text-muted text-sm">
                  {copy.kinds[project.kind]} · {project.year}
                </span>
              </div>
              <p className="text-cyan mt-6 text-sm font-semibold">{text.kicker}</p>
              <h1 className={`mt-2 text-5xl font-semibold tracking-tight md:text-7xl ${headingGradient}`}>
                {text.name}
              </h1>
              <p className="text-muted mt-6 max-w-[680px] text-xl">{text.tagline}</p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener"
                  className="bg-violet hover:bg-violet-soft inline-flex min-h-12 items-center gap-2 rounded-lg px-3 py-2 text-base font-semibold text-white transition-all duration-700 ease-fluid hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  {copy.visit} {host}
                  <ArrowUpRight size={16} weight="bold" aria-hidden />
                </a>
                {project.code.visibility === "private" ? (
                  <span className="text-muted inline-flex items-center gap-2 text-sm">
                    <LockSimple size={16} aria-hidden className="shrink-0" />
                    {copy.code.private}
                  </span>
                ) : null}
              </div>
            </header>
          </Reveal>

          <Reveal className="mt-16">
            <div className="border-line bg-surface rounded-2xl border p-2">
              <Showcase project={project} shot={cover} lang={lang} copy={copy} priority />
            </div>
          </Reveal>

          <div className="mt-24 grid gap-16 lg:grid-cols-[2fr_1fr] lg:gap-12">
            <div className="flex flex-col gap-16">
              <Section title={copy.labels.problem}>
                <p className="text-lg">{text.problem}</p>
              </Section>

              <Section title={copy.labels.work}>
                <ul className="flex flex-col gap-4">
                  {text.work.map((point) => (
                    <li key={point} className="flex gap-3 text-base">
                      <CheckCircle size={20} weight="fill" className="text-mint mt-0.5 shrink-0" aria-hidden />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title={copy.labels.decisions}>
                <ul className="grid gap-4 md:grid-cols-2">
                  {text.decisions.map((decision) => (
                    <li key={decision.title} className="border-line bg-surface rounded-2xl border p-6">
                      <h3 className="text-xl font-semibold tracking-tight">{decision.title}</h3>
                      <p className="text-muted mt-2 text-base">{decision.body}</p>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title={copy.labels.result}>
                <p className="text-lg">{text.result}</p>
              </Section>
            </div>

            <aside className="self-start lg:sticky lg:top-32">
              <Reveal delay={100}>
                <div className="border-line bg-surface rounded-2xl border p-6">
                  <h2 className="text-muted font-mono text-xs uppercase">{copy.labels.details}</h2>
                  <dl className="mt-6 flex flex-col gap-4">
                    {facts.map((fact) => (
                      <div key={fact.label}>
                        <dt className="text-muted font-mono text-xs uppercase">{fact.label}</dt>
                        <dd className="mt-1 text-base">{fact.value}</dd>
                      </div>
                    ))}
                    <div>
                      <dt className="text-muted font-mono text-xs uppercase">{copy.labels.stack}</dt>
                      <dd className="mt-2">
                        <ul className="flex flex-wrap gap-2">
                          {project.stack.map((tag) => (
                            <li key={tag} className="border-line text-muted rounded-full border px-3 py-1 text-xs">
                              {tag}
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  </dl>
                </div>
              </Reveal>
            </aside>
          </div>

          {gallery.length > 0 ? (
            <section className="mt-24">
              <Reveal>
                <h2 className="text-3xl font-semibold tracking-tight">{copy.gallery}</h2>
              </Reveal>
              <div className="mt-8 flex flex-col gap-12">
                {gallery.map((shot) => (
                  <Reveal key={shot.name}>
                    <figure>
                      <div className="grid items-start gap-6 sm:grid-cols-[3fr_1fr]">
                        <div className="border-line bg-surface rounded-2xl border p-2">
                          <Image
                            src={shotSrc(project, shot.name, "desktop")}
                            alt={`${shot.alt[lang]}, ${copy.devices.desktop}`}
                            {...shotSize.desktop}
                            className="aspect-[16/10] w-full rounded-lg object-cover"
                          />
                        </div>
                        <div className="border-line bg-surface mx-auto w-1/2 max-w-60 rounded-3xl border p-2 sm:w-full">
                          <Image
                            src={shotSrc(project, shot.name, "mobile")}
                            alt={`${shot.alt[lang]}, ${copy.devices.mobile}`}
                            {...shotSize.mobile}
                            className="w-full rounded-2xl"
                          />
                        </div>
                      </div>
                      <figcaption className="text-muted mt-4 text-sm">{shot.alt[lang]}</figcaption>
                    </figure>
                  </Reveal>
                ))}
              </div>
            </section>
          ) : null}

          {neighbors ? (
            <nav aria-label={copy.eyebrow} className="mt-24 grid gap-4 sm:grid-cols-2">
              {[
                { project: neighbors.prev, label: copy.prev, Icon: ArrowLeft },
                { project: neighbors.next, label: copy.next, Icon: ArrowRight },
              ].map(({ project: other, label, Icon }) => (
                <Link
                  key={label}
                  href={projectsPath(lang, other.slug)}
                  className="border-line bg-surface hover:bg-ink/5 flex flex-col gap-1 rounded-2xl border p-6 transition-all duration-700 ease-fluid active:scale-[0.98]"
                >
                  <span className="text-muted flex items-center gap-2 text-sm">
                    <Icon size={16} aria-hidden />
                    {label}
                  </span>
                  <span className="text-xl font-semibold tracking-tight">{other.copy[lang].name}</span>
                </Link>
              ))}
            </nav>
          ) : null}
        </article>
        <Contact copy={dict.contact} />
      </main>
      <Footer lang={lang} copy={dict.footer} alternate={alternate} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: graph(projectGraph(project, lang)) }}
      />
    </>
  );
}
