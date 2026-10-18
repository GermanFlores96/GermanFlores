"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp } from "@phosphor-icons/react";
import { ChapterCopy } from "./ChapterCopy";
import { TourController, type TourState } from "./controller";
import { MotionNotice } from "@/components/MotionNotice";
import type { useMotionPrefs } from "@/lib/motion";
import { scenes, tourAssets } from "@/content/shared";
import type { Dictionary } from "@/content/types";

type Props = {
  active: boolean; // mounted and visible (narrow screen): only then does it load and play anything
  prefs: ReturnType<typeof useMotionPrefs>;
  flight: Dictionary["flight"];
  email: string;
};

const assets = tourAssets("m");
const LAST = scenes.length - 1;
const initial: TourState = { chapter: 0, moving: false, target: 0, loading: null };

// Phones: one full screen, TikTok style. Swipe up = next chapter (plays a short trip), swipe down = previous
// (crossfade). On the last chapter, swiping up leaves the tour for the profile sections, which scroll normally.
export function TourMobile({ active, prefs, flight, email }: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const layerA = useRef<HTMLImageElement>(null);
  const layerB = useRef<HTMLImageElement>(null);
  const ctrl = useRef<TourController | null>(null);
  const [st, setSt] = useState<TourState>(initial);
  const [swiped, setSwiped] = useState(false);
  const animated = !prefs.stills;

  useEffect(() => {
    if (!active || !video.current || !layerA.current || !layerB.current) return;
    const c = new TourController({
      video: video.current,
      layers: [layerA.current, layerB.current],
      ...assets,
      animated,
      onChange: setSt,
    });
    ctrl.current = c;
    void c.start();
    return () => {
      c.destroy();
      ctrl.current = null;
      setSt(initial);
    };
  }, [active, animated]);

  // Gestures: touch swipes, the wheel (narrow desktop windows) and the arrow keys.
  useEffect(() => {
    const el = stage.current;
    if (!active || !el) return;

    const contenido = () => document.getElementById("contenido");
    const leave = () => {
      const target = contenido();
      if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: "smooth" });
    };
    const step = (dir: 1 | -1) => {
      const c = ctrl.current;
      if (!c) return;
      setSwiped(true);
      // Tour partly scrolled away (coming back from the sections): settle the page first.
      if (window.scrollY > 4) {
        if (dir > 0) leave();
        else window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (dir > 0) {
        if (!c.next()) leave();
      } else c.prev();
    };

    let y0 = 0;
    let t0 = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      y0 = e.touches[0].clientY;
      t0 = performance.now();
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dy = y0 - (e.changedTouches[0]?.clientY ?? y0);
      const fast = Math.abs(dy) / Math.max(1, performance.now() - t0) > 0.4; // a flick counts even if short
      if (Math.abs(dy) < 40 && !(fast && Math.abs(dy) > 16)) return;
      step(dy > 0 ? 1 : -1);
    };

    // One wheel gesture = one step: a new gesture needs a short pause, and steps are at least 900 ms apart,
    // so trackpad inertia never skips scenes.
    let lastWheel = 0;
    let lastStep = 0;
    const onWheel = (e: WheelEvent) => {
      if (window.scrollY > 4) return; // let the page scroll normally while the tour is not fully in view
      e.preventDefault();
      const now = performance.now();
      const newGesture = now - lastWheel > 220;
      lastWheel = now;
      if (Math.abs(e.deltaY) < 8 || (!newGesture && now - lastStep < 900)) return;
      lastStep = now;
      step(e.deltaY > 0 ? 1 : -1);
    };

    const onKey = (e: KeyboardEvent) => {
      if (window.scrollY > 4 || e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t && t.closest("input, textarea, select, button, a, [contenteditable]")) return;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        step(-1);
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  // Copy: hidden while a trip plays (except over the intro), shown once the scene has arrived.
  const shown = st.moving ? (st.chapter === 0 && st.target === 0 ? 0 : -1) : st.chapter;
  const atRest = !st.moving;

  return (
    <div
      ref={stage}
      // touch-none: the swipe moves between chapters instead of scrolling the page.
      className="bg-bg relative h-svh touch-none overflow-hidden select-none"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- crossfade layers driven by the controller */}
      <img ref={layerA} src={assets.start} alt="" className="tour-layer is-on" style={{ zIndex: 2 }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={layerB} alt="" className="tour-layer" />
      <video ref={video} className="tour-video" muted playsInline preload="none" aria-hidden />

      {/* Legibility backing for the copy at the bottom. */}
      <div className="from-bg via-bg/80 pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-3/4 bg-linear-to-t to-transparent" />

      <div aria-live="polite" className="absolute inset-x-4 bottom-24 z-[5]">
        {flight.scenes.map((scene, i) => (
          <div
            key={scene.label}
            aria-hidden={shown !== i}
            inert={shown !== i}
            className={`absolute inset-x-0 bottom-0 transition-all duration-500 ease-fluid ${
              shown === i ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
            }`}
          >
            <ChapterCopy
              scene={scene}
              index={i}
              total={scenes.length}
              accent={scenes[i].accent}
              compact
              cta={i === LAST ? { ...flight.finalCta, email } : undefined}
            />
          </div>
        ))}
      </div>

      {/* Gesture hint: first chapter until the first swipe, and on the last chapter. */}
      <div
        aria-hidden
        className={`text-muted pointer-events-none absolute inset-x-0 bottom-6 z-[5] flex items-center justify-center gap-2 text-xs font-semibold tracking-widest uppercase transition-opacity duration-500 ease-fluid ${
          atRest && ((st.chapter === 0 && !swiped) || st.chapter === LAST) ? "opacity-100" : "opacity-0"
        }`}
      >
        {st.chapter === LAST ? flight.swipeLast : flight.swipe}
        <ArrowUp size={14} weight="bold" className="sw-bounce" />
      </div>

      {/* Chapter dots. */}
      <nav aria-label={flight.summaryLabel} className="absolute top-1/2 right-2 z-[6] flex -translate-y-1/2 flex-col">
        {flight.scenes.map((scene, i) => (
          <button
            key={scene.label}
            type="button"
            aria-label={`${flight.goTo} ${i + 1}: ${scene.label}`}
            aria-current={st.target === i ? "step" : undefined}
            onClick={() => {
              setSwiped(true);
              ctrl.current?.goTo(i);
            }}
            className="grid size-7 place-items-center"
          >
            <i
              className={`block rounded-full transition-all duration-500 ease-fluid ${
                st.target === i ? "size-2.5" : "size-1.5 opacity-50"
              }`}
              style={{ background: scenes[i].accent }}
            />
          </button>
        ))}
      </nav>

      <div className="pointer-events-none absolute inset-x-4 top-24 z-[6] flex flex-col items-end gap-2">
        <MotionNotice motion={flight.motion} reduced={prefs.reduced} choice={prefs.choice} stills={prefs.stills} />
        <a
          href="#contenido"
          className="border-line bg-bg/70 text-muted hover:text-ink pointer-events-auto flex min-h-10 items-center gap-1 rounded-full border px-3 py-2 text-sm font-semibold backdrop-blur-xl transition-all duration-700 ease-fluid active:scale-[0.98]"
        >
          {flight.skip}
          <ArrowDown size={16} weight="bold" aria-hidden />
        </a>
      </div>

      <TourLoading label={flight.loading} loading={st.loading} />
    </div>
  );
}

export function TourLoading({ label, loading }: { label: string; loading: number | null }) {
  const pct = loading != null && loading >= 0 ? Math.round(loading * 100) : null;
  return (
    <div role="status" className={`tour-loading ${loading != null ? "is-on" : ""}`}>
      <span className="text-ink block text-sm font-semibold">
        {label}
        {pct != null ? ` · ${pct} %` : ""}
      </span>
      <i className={`tour-loading__bar ${pct == null ? "is-indeterminate" : ""}`}>
        <b style={{ transform: `scaleX(${pct == null ? 0.25 : pct / 100})` }} />
      </i>
    </div>
  );
}
