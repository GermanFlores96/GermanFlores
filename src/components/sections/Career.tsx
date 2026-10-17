import { CheckCircle, MapPin } from "@phosphor-icons/react/ssr";
import { Reveal } from "@/components/ui/Reveal";
import type { Dictionary } from "@/content/types";

export function Career({ copy }: { copy: Dictionary["career"] }) {
  return (
    <section id="trayectoria" className="scroll-mt-24 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-violet-soft text-sm font-semibold">{copy.eyebrow}</p>
          <h2 className="mt-2 max-w-[680px] text-4xl leading-10 font-semibold tracking-tight md:text-5xl md:leading-none">
            {copy.title}
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-12 lg:grid-cols-[2fr_1fr]">
          <ol className="flex flex-col gap-6">
            {copy.jobs.map((job) => (
              <li key={job.company}>
                <Reveal>
                  <article className="border-line bg-surface rounded-2xl border p-6 md:p-8">
                    <header className="flex flex-col gap-1">
                      <h3 className="text-2xl leading-8 font-semibold tracking-tight">
                        {job.role}
                      </h3>
                      <p className="text-lg text-cyan">{job.company}</p>
                      <p className="text-muted mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                        <span className="font-mono">{job.period}</span>
                        <span className="flex items-center gap-1">
                          <MapPin size={16} aria-hidden />
                          {job.place}
                        </span>
                      </p>
                    </header>
                    <ul className="mt-8 flex flex-col gap-4">
                      {job.points.map((point) => (
                        <li key={point} className="flex gap-3 text-base">
                          <CheckCircle
                            size={20}
                            weight="fill"
                            className="text-mint mt-0.5 shrink-0"
                            aria-hidden
                          />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
              </li>
            ))}
          </ol>

          <Reveal delay={100}>
            <h3 className="text-muted font-mono text-xs uppercase">{copy.educationTitle}</h3>
            <ul className="mt-4 flex flex-col gap-4">
              {copy.education.map((item) => (
                <li key={item.school} className="border-line bg-surface rounded-2xl border p-6">
                  <p className="text-lg leading-7 font-semibold">{item.school}</p>
                  <p className="text-muted mt-1 text-base">{item.degree}</p>
                  <p className="text-muted mt-2 font-mono text-sm">{item.period}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
