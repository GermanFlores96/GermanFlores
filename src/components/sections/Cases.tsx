import Image from "next/image";
import { DeviceMobile, Robot, ShieldCheck } from "@phosphor-icons/react/ssr";
import { Reveal } from "@/components/ui/Reveal";
import type { Dictionary } from "@/content/types";

const posters = {
  mony: { src: "/img/scenes/mony.webp", Icon: DeviceMobile },
  security: { src: "/img/scenes/boveda.webp", Icon: ShieldCheck },
  ai: { src: "/img/scenes/taller-ia.webp", Icon: Robot },
} as const;

export function Cases({ copy }: { copy: Dictionary["cases"] }) {
  return (
    <section id="casos" className="scroll-mt-24 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-violet-soft text-sm font-semibold">{copy.eyebrow}</p>
          <h2 className="mt-2 max-w-[680px] text-4xl leading-10 font-semibold tracking-tight md:text-5xl md:leading-none">
            {copy.title}
          </h2>
          <p className="text-muted mt-4 max-w-[680px] text-lg">{copy.intro}</p>
        </Reveal>

        <ul className="mt-16 grid gap-6 lg:grid-cols-3">
          {copy.items.map((item, i) => {
            const { src, Icon } = posters[item.id];
            const rows = [
              [copy.labels.challenge, item.challenge],
              [copy.labels.work, item.work],
              [copy.labels.result, item.result],
            ] as const;
            return (
              <li key={item.id} className="flex">
                <Reveal delay={i * 100} className="flex w-full">
                  <article className="border-line bg-surface flex w-full flex-col rounded-2xl border p-2">
                    <Image
                      src={src}
                      alt=""
                      width={960}
                      height={540}
                      sizes="(min-width: 1024px) 384px, 100vw"
                      className="aspect-video w-full rounded-lg object-cover"
                    />
                    <div className="flex flex-1 flex-col gap-6 p-4">
                      <header>
                        <p className="text-cyan flex items-center gap-2 text-sm font-semibold">
                          <Icon size={16} weight="bold" aria-hidden />
                          {item.kicker}
                        </p>
                        <h3 className="mt-2 text-2xl leading-8 font-semibold tracking-tight">
                          {item.title}
                        </h3>
                      </header>

                      <dl className="flex flex-col gap-4">
                        {rows.map(([label, text]) => (
                          <div key={label}>
                            <dt className="text-muted font-mono text-xs uppercase">{label}</dt>
                            <dd className="mt-1 text-base">{text}</dd>
                          </div>
                        ))}
                      </dl>

                      <ul className="mt-auto flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <li
                            key={tag}
                            className="border-line text-muted rounded-full border px-3 py-1 text-xs"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
