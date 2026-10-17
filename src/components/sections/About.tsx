import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import type { Dictionary } from "@/content/types";

export function About({ copy }: { copy: Dictionary["about"] }) {
  return (
    <section id="sobre-mi" className="scroll-mt-24 px-6 py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <Reveal className="order-2 lg:order-1">
          <p className="text-violet-soft text-sm font-semibold">{copy.eyebrow}</p>
          <h2 className="mt-2 max-w-[680px] text-4xl leading-10 font-semibold tracking-tight md:text-5xl md:leading-none">
            {copy.title}
          </h2>
          <div className="mt-6 flex max-w-[680px] flex-col gap-4 text-lg">
            {copy.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <dl className="mt-8 grid max-w-[680px] gap-4 sm:grid-cols-3">
            {copy.facts.map((fact) => (
              <div key={fact.label} className="border-line bg-surface rounded-2xl border p-4">
                <dt className="text-muted font-mono text-xs uppercase">{fact.label}</dt>
                <dd className="mt-1 text-base">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={100} className="order-1 lg:order-2">
          <div className="border-line bg-surface mx-auto max-w-md rounded-2xl border p-2">
            <Image
              src="/img/german.webp"
              alt={copy.photoAlt}
              width={960}
              height={1200}
              sizes="(min-width: 1024px) 448px, 100vw"
              className="aspect-[4/5] w-full rounded-lg object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
