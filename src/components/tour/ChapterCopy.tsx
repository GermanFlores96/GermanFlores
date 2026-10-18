import { ArrowDown, EnvelopeSimple } from "@phosphor-icons/react";
import type { FlightCopy } from "@/content/types";

type Props = {
  scene: FlightCopy;
  index: number;
  total: number;
  accent: string;
  /** Only the last chapter gets actions: it must lead on to the profile, not read as the end. */
  cta?: { primary: string; secondary: string; email: string };
  compact?: boolean;
};

const pad = (n: number) => String(n).padStart(2, "0");

export function ChapterCopy({ scene, index, total, accent, cta, compact = false }: Props) {
  return (
    <div className="flex flex-col">
      <span className="text-muted font-mono text-xs">
        {pad(index + 1)} / {pad(total)}
      </span>
      <span className="mt-4 text-sm font-semibold" style={{ color: accent }}>
        {scene.eyebrow}
      </span>
      <h2
        className={`mt-2 bg-linear-to-r from-white to-[#9b9b9b] bg-clip-text font-semibold tracking-tight text-transparent ${
          compact ? "text-4xl leading-10" : "text-4xl leading-10 xl:text-6xl xl:leading-none"
        }`}
      >
        {scene.title}
      </h2>
      <p className={`text-ink mt-4 max-w-xl ${compact ? "text-base" : "text-lg"}`}>{scene.body}</p>
      {scene.tags.length ? (
        <ul className="mt-6 flex flex-wrap gap-2">
          {scene.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-[rgb(155_135_255/0.4)] bg-[rgb(124_92_255/0.18)] px-3 py-1 text-sm font-medium"
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
      {cta ? (
        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="#casos"
            className="bg-violet hover:bg-violet-soft inline-flex min-h-12 items-center gap-2 rounded-lg px-3 py-2 text-base font-semibold text-white transition-all duration-700 ease-fluid hover:-translate-y-0.5 active:scale-[0.98]"
          >
            {cta.primary}
            <ArrowDown size={16} weight="bold" aria-hidden />
          </a>
          <a
            href={`mailto:${cta.email}`}
            className="border-line hover:bg-ink/10 inline-flex min-h-12 items-center gap-2 rounded-lg border px-3 py-2 text-base font-semibold transition-all duration-700 ease-fluid hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <EnvelopeSimple size={20} aria-hidden />
            {cta.secondary}
          </a>
        </div>
      ) : null}
    </div>
  );
}
