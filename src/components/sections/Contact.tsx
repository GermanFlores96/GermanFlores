import { ArrowUpRight, EnvelopeSimple, LinkedinLogo } from "@phosphor-icons/react/ssr";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/content/shared";
import type { Dictionary } from "@/content/types";

export function Contact({ copy }: { copy: Dictionary["contact"] }) {
  return (
    <section id="contacto" className="scroll-mt-24 px-6 py-24">
      <Reveal className="mx-auto max-w-6xl">
        <div className="border-line bg-surface rounded-2xl border p-8 md:p-16">
          <p className="text-mint flex items-center gap-2 text-sm font-semibold">
            <span className="bg-mint size-2 rounded-full" aria-hidden />
            {copy.availability}
          </p>
          <h2 className="mt-4 max-w-[680px] text-4xl leading-10 font-semibold tracking-tight md:text-6xl md:leading-none">
            {copy.title}
          </h2>
          <p className="text-muted mt-4 max-w-[680px] text-lg">{copy.body}</p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={`mailto:${site.email}`}
              className="bg-violet hover:bg-violet-soft inline-flex min-h-12 items-center gap-2 rounded-lg px-3 py-2 text-base font-semibold text-white transition-all duration-700 ease-fluid hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <EnvelopeSimple size={20} aria-hidden />
              {copy.email}
            </a>
            <a
              href={site.linkedin}
              target="_blank"
              rel="me noopener noreferrer"
              className="border-line hover:bg-ink/10 inline-flex min-h-12 items-center gap-2 rounded-lg border px-3 py-2 text-base font-semibold transition-all duration-700 ease-fluid hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <LinkedinLogo size={20} aria-hidden />
              {copy.linkedin}
              <ArrowUpRight size={16} weight="bold" aria-hidden />
            </a>
          </div>
          <p className="text-muted mt-6 font-mono text-sm">{site.email}</p>
        </div>
      </Reveal>
    </section>
  );
}
