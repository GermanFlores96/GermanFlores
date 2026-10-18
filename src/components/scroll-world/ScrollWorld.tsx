"use client";

// Previous tour: the camera is scrubbed by the scroll position. Kept as a one line fallback
// (`TOUR = "scrub"` in src/content/shared.ts); the current tour lives in src/components/tour.

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown } from "@phosphor-icons/react";
import { mountScrollWorld } from "./engine";
import { MotionNotice } from "@/components/MotionNotice";
import { useMotionPrefs } from "@/lib/motion";
import { connectors, connectorsMobile, sceneAssets, scenes } from "@/content/shared";
import type { Dictionary, FlightCopy } from "@/content/types";

type Props = {
  /** False keeps it inert (rendered but hidden): no engine, no downloads. */
  enabled?: boolean;
  copy: FlightCopy[];
  hint: string;
  skip: string;
  summaryLabel: string;
  loading: string;
  more: string;
  motion: Dictionary["flight"]["motion"];
  cta: { primary: string; secondary: string };
  email: string;
};

export function ScrollWorld({ enabled = true, copy, hint, skip, summaryLabel, loading, more, motion, cta, email }: Props) {
  const host = useRef<HTMLDivElement>(null);
  // Scene the engine reports as active; the last one shows the "keep scrolling" cue.
  const [active, setActive] = useState(0);
  const { reduced, choice, ready, stills } = useMotionPrefs();

  // The engine builds its own DOM, so the config is the only thing React owns here.
  const config = useMemo(
    () => ({
      hint,
      loadingLabel: loading,
      onSection: setActive,
      // Stopping on an empty stretch finishes the trip in the direction of the scroll, never against it (snapping
      // back after a small scroll read as the animation "going backwards").
      finishTrips: true,
      motion: stills ? "still" : "full",
      nav: false,
      atmosphere: false,
      diveScroll: 1.3,
      connScroll: 1.0,
      sections: scenes.map((scene, i) => ({
        id: scene.id,
        label: copy[i].label,
        ...sceneAssets(scene.id),
        accent: scene.accent,
        scroll: scene.scroll,
        linger: scene.linger,
        eyebrow: copy[i].eyebrow,
        title: copy[i].title,
        body: copy[i].body,
        tags: copy[i].tags,
        ...(i === scenes.length - 1
          ? {
              // The last scene must not read as an ending: its main action leads on to the profile sections.
              cta: {
                primary: { label: cta.primary, href: "#casos" },
                secondary: { label: cta.secondary, href: `mailto:${email}` },
              },
            }
          : {}),
      })),
      connectors,
      connectorsMobile,
    }),
    [copy, hint, loading, cta, email, stills],
  );

  useEffect(() => {
    const el = host.current;
    if (!el || !ready || !enabled) return;
    const world = mountScrollWorld(el, config);
    // The same copy is in the server rendered summary below, so assistive tech reads it once, in order.
    el.querySelector(".sw-copylayer")?.setAttribute("aria-hidden", "true");
    el.querySelectorAll<HTMLElement>(".sw-copylayer a").forEach((link) => (link.tabIndex = -1));
    return () => world?.destroy();
  }, [config, ready, enabled]);

  // Jump straight past the flight. Instant on purpose: a smooth scroll would scrub (and download) every clip.
  const skipFlight = () => {
    const target = document.getElementById("contenido");
    if (!target) return;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
    target.focus({ preventScroll: true });
  };

  return (
    <>
      {/* Server rendered copy of the flight, for search engines, link previews and screen readers. */}
      <div className="sr-only">
        <p>{summaryLabel}</p>
        {copy.map((scene) => (
          <section key={scene.label}>
            <h2>{scene.title}</h2>
            <p>{scene.eyebrow}</p>
            <p>{scene.body}</p>
          </section>
        ))}
      </div>

      <div
        id="vuelo"
        ref={host}
        // Poster of the first scene until the engine mounts (desktop or portrait, see globals.css).
        className="bg-bg min-h-svh bg-cover bg-center"
      />

      {/* On the last scene: it must not read as the end of the page. Hidden with the rest once the sections cover it. */}
      <div
        aria-hidden
        className={`sw-more border-line bg-bg/70 text-ink pointer-events-none fixed bottom-4 left-1/2 z-[340] flex -translate-x-1/2 items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold backdrop-blur-xl transition-all duration-700 ease-fluid ${
          active === scenes.length - 1 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        {more}
        <ArrowDown size={16} weight="bold" className="sw-bounce" aria-hidden />
      </div>

      {/* Sibling of the host so CSS can hide it once the flight is over (`#vuelo.is-done ~ .sw-flight-ui`). */}
      <div className="sw-flight-ui pointer-events-none fixed inset-x-4 top-24 z-[350] flex flex-col items-end gap-2 sm:inset-x-auto sm:top-auto sm:right-4 sm:bottom-4 sm:w-[28rem]">
        <MotionNotice motion={motion} reduced={reduced} choice={choice} stills={stills} />

        <button
          type="button"
          onClick={skipFlight}
          className="border-line bg-bg/70 text-muted hover:text-ink pointer-events-auto flex min-h-10 items-center gap-1 rounded-full border px-3 py-2 text-sm font-semibold backdrop-blur-xl transition-all duration-700 ease-fluid active:scale-[0.98]"
        >
          {skip}
          <ArrowDown size={16} weight="bold" aria-hidden />
        </button>
      </div>
    </>
  );
}
