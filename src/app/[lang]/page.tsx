import { notFound } from "next/navigation";
import { ScrollWorld } from "@/components/scroll-world/ScrollWorld";
import { SiteNav } from "@/components/SiteNav";
import { About } from "@/components/sections/About";
import { Career } from "@/components/sections/Career";
import { Cases } from "@/components/sections/Cases";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { Stack } from "@/components/sections/Stack";
import { TaglineReveal } from "@/components/ui/TaglineReveal";
import { getDictionary } from "@/content/dictionaries";
import { site } from "@/content/shared";
import { hasLocale } from "@/content/types";

export default async function Page({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <>
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
      />

      <main id="top">
        <h1 className="sr-only">
          {site.name}, {dict.nav.brandRole}
        </h1>

        <ScrollWorld
          copy={dict.flight.scenes}
          hint={dict.flight.hint}
          skip={dict.flight.skip}
          summaryLabel={dict.flight.summaryLabel}
          loading={dict.flight.loading}
          more={dict.flight.more}
          motion={dict.flight.motion}
          cta={dict.flight.finalCta}
          email={site.email}
        />

        {/* Sections slide up over the fixed flight layers, so they need an opaque background and a higher stack. */}
        <div id="contenido" tabIndex={-1} className="bg-bg relative z-[200] focus:outline-none">
          <section className="flex min-h-svh items-center px-6 py-24" aria-label={dict.cases.eyebrow}>
            <div className="mx-auto w-full max-w-6xl">
              <TaglineReveal text={dict.tagline.lines} />
            </div>
          </section>
          <Cases copy={dict.cases} />
          <Stack copy={dict.stack} />
          <Career copy={dict.career} />
          <About copy={dict.about} />
          <Contact copy={dict.contact} />
          <Footer lang={lang} copy={dict.footer} />
        </div>
      </main>
    </>
  );
}
