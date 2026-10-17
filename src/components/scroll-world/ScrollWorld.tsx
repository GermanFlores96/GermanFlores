"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ArrowDown } from "@phosphor-icons/react";
import { mountScrollWorld } from "./engine";
import { connectors, connectorsMobile, sceneAssets, scenes } from "@/content/shared";
import type { Dictionary, FlightCopy } from "@/content/types";

type Props = {
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

// The flight is animated for everyone by default: the video never plays on its own, it only advances while the
// visitor scrolls. Many systems report `prefers-reduced-motion` without the person knowing (Windows with animations
// off, power saver, remote desktop), so that signal alone must not turn the main experience into still images.
// People who do want less motion get a visible choice, remembered for the session (sessionStorage, not a cookie).
// Data saver is different: it is an explicit request to spend less data, so those visitors start with the posters
// (no video downloads) and can turn the flight on.
const REDUCED = "(prefers-reduced-motion: reduce)";
const CHOICE_KEY = "sw-motion";
const CHOICE_EVENT = "sw-motion-change";
type Choice = "still" | "animated" | "ack" | null;

const subscribeReduced = (notify: () => void) => {
  const query = window.matchMedia(REDUCED);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
const readReduced = () => window.matchMedia(REDUCED).matches;

// Network Information API: Chromium browsers only; elsewhere it is simply absent and the flight loads as usual.
type NetworkInfo = EventTarget & { saveData?: boolean; effectiveType?: string };
const connection = () => (navigator as Navigator & { connection?: NetworkInfo }).connection;
const subscribeLowData = (notify: () => void) => {
  const c = connection();
  c?.addEventListener("change", notify);
  return () => c?.removeEventListener("change", notify);
};
const readLowData = () => {
  const c = connection();
  return Boolean(c?.saveData) || c?.effectiveType === "slow-2g" || c?.effectiveType === "2g";
};

const subscribeNever = () => () => {};

const subscribeChoice = (notify: () => void) => {
  window.addEventListener(CHOICE_EVENT, notify);
  return () => window.removeEventListener(CHOICE_EVENT, notify);
};
const readChoice = (): Choice => {
  try {
    const value = sessionStorage.getItem(CHOICE_KEY);
    return value === "still" || value === "animated" || value === "ack" ? value : null;
  } catch {
    return null;
  }
};
const writeChoice = (choice: Choice) => {
  try {
    if (choice) sessionStorage.setItem(CHOICE_KEY, choice);
    else sessionStorage.removeItem(CHOICE_KEY);
  } catch {
    /* private mode: the choice just lasts until the next load */
  }
  window.dispatchEvent(new Event(CHOICE_EVENT));
};

const buttonClass =
  "min-h-12 rounded-lg px-3 py-2 text-base font-semibold transition-all duration-700 ease-fluid active:scale-[0.98]";

export function ScrollWorld({ copy, hint, skip, summaryLabel, loading, more, motion, cta, email }: Props) {
  const host = useRef<HTMLDivElement>(null);
  // Scene the engine reports as active; the last one shows the "keep scrolling" cue.
  const [active, setActive] = useState(0);
  const reduced = useSyncExternalStore(subscribeReduced, readReduced, () => false);
  const choice = useSyncExternalStore(subscribeChoice, readChoice, () => null);
  const lowData = useSyncExternalStore(subscribeLowData, readLowData, () => false);
  // False during server render and hydration, true once the real client values above are known. The engine
  // waits for it, otherwise it would start downloading with the server defaults and then remount.
  const ready = useSyncExternalStore(subscribeNever, () => true, () => false);
  const stills = choice === "still" || (lowData && choice !== "animated");

  // The engine builds its own DOM, so the config is the only thing React owns here.
  const config = useMemo(
    () => ({
      hint,
      loadingLabel: loading,
      onSection: setActive,
      // When scrolling stops between scenes, the camera finishes the trip to the nearest scene in the direction
      // the visitor was heading, so nobody is left on an empty stretch without copy.
      stations: true,
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
    if (!el || !ready) return;
    const world = mountScrollWorld(el, config);
    // The same copy is in the server rendered summary below, so assistive tech reads it once, in order.
    el.querySelector(".sw-copylayer")?.setAttribute("aria-hidden", "true");
    el.querySelectorAll<HTMLElement>(".sw-copylayer a").forEach((link) => (link.tabIndex = -1));
    return () => world?.destroy();
  }, [config, ready]);

  // Jump straight past the flight. Instant on purpose: a smooth scroll would scrub (and download) every clip.
  const skipFlight = () => {
    const target = document.getElementById("contenido");
    if (!target) return;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
    target.focus({ preventScroll: true });
  };

  // Notice states: showing posters (data saver, or chosen) offers the flight back; a reduced motion system
  // with the flight running offers the posters until the visitor answers. Everyone else sees nothing.
  const notice = stills
    ? choice === "still" ? motion.noticeStill : motion.noticeLowData
    : reduced && choice === null ? motion.noticeAnimated : null;

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
        {notice ? (
          <div
            role="region"
            aria-label={notice}
            className="border-line bg-surface/90 pointer-events-auto flex w-full flex-col items-start gap-3 rounded-2xl border p-4 backdrop-blur-xl"
          >
            <p className="text-muted text-sm">{notice}</p>
            <div className="flex flex-wrap gap-2">
              {stills ? (
                <button
                  type="button"
                  onClick={() => writeChoice("animated")}
                  className={`${buttonClass} bg-violet hover:bg-violet-soft text-white`}
                >
                  {motion.toAnimated}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => writeChoice("still")}
                    className={`${buttonClass} border-line hover:bg-ink/10 border`}
                  >
                    {motion.toStill}
                  </button>
                  <button
                    type="button"
                    onClick={() => writeChoice("ack")}
                    className={`${buttonClass} bg-violet hover:bg-violet-soft text-white`}
                  >
                    {motion.dismiss}
                  </button>
                </>
              )}
            </div>
          </div>
        ) : null}

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
