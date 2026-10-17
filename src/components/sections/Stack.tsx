import { Reveal } from "@/components/ui/Reveal";
import type { Dictionary } from "@/content/types";

const accents = ["text-violet-soft", "text-cyan", "text-mint", "text-ink"] as const;

export function Stack({ copy }: { copy: Dictionary["stack"] }) {
  return (
    <section id="stack" className="scroll-mt-24 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-violet-soft text-sm font-semibold">{copy.eyebrow}</p>
          <h2 className="mt-2 max-w-[680px] text-4xl leading-10 font-semibold tracking-tight md:text-5xl md:leading-none">
            {copy.title}
          </h2>
        </Reveal>

        {/* Six column track: the first three groups take a third each, the rest share the last row in halves. */}
        <ul className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          {copy.groups.map((group, i) => (
            <li key={group.title} className={`flex ${i < 3 ? "lg:col-span-2" : "lg:col-span-3"}`}>
              <Reveal delay={i * 100} className="flex w-full">
                <section className="border-line bg-surface w-full rounded-2xl border p-6">
                  <h3 className={`text-lg leading-7 font-semibold ${accents[i % accents.length]}`}>
                    {group.title}
                  </h3>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="border-line bg-bg rounded-full border px-3 py-1 text-sm"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
