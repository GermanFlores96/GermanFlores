"use client";

import { useEffect, useRef } from "react";

// Large statement whose words light up one at a time as they cross a trigger line (60% down the viewport).
export function TaglineReveal({ text }: { text: string }) {
  const root = useRef<HTMLParagraphElement>(null);
  const words = text.split(" ");

  useEffect(() => {
    const spans = root.current?.querySelectorAll<HTMLElement>(".word");
    if (!spans?.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      spans.forEach((span) => (span.dataset.on = "true"));
      return;
    }

    // The shrunk root puts the trigger line at 60% of the viewport height; a word is lit while it is above it.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          (entry.target as HTMLElement).dataset.on = entry.isIntersecting ? "true" : "false";
        }
      },
      { rootMargin: "0px 0px -40% 0px" },
    );
    spans.forEach((span) => io.observe(span));
    return () => io.disconnect();
  }, []);

  return (
    <p
      ref={root}
      className="max-w-[680px] text-4xl leading-10 font-semibold tracking-tight md:text-5xl md:leading-none lg:text-6xl lg:leading-none"
    >
      {words.map((word, i) => (
        <span key={i}>
          <span className="word text-ink/30 transition-colors duration-700 ease-fluid data-[on=true]:text-ink">
            {word}
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </p>
  );
}
