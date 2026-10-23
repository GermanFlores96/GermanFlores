"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp } from "@phosphor-icons/react";
import { ChapterCopy } from "./ChapterCopy";
import { TourController, type TourState } from "./controller";
import { MotionNotice } from "@/components/MotionNotice";
import type { useMotionPrefs } from "@/lib/motion";
import { scenes, tourAssets, type TourVariant } from "@/content/shared";
import type { Dictionary } from "@/content/types";

type Props = {
  variant: TourVariant; // phone: media 9:16, copy at the bottom, the finger drags the camera; desktop: 16:9, copy on the left
  active: boolean; // mounted and visible (its screen size): only then does it load and play anything
  prefs: ReturnType<typeof useMotionPrefs>;
  flight: Dictionary["flight"];
  email: string;
};

const LAST = scenes.length - 1;
const initial: TourState = { chapter: 0, moving: false, target: 0, settling: false, loading: null };

// One full screen, a chapter at a time. A gesture plays the whole trip to the next scene, never a scroll position.
// Phones, TikTok style: dragging up or down moves the camera with the finger towards the next or previous chapter;
// letting go finishes the trip on its own (or plays back if it was a short drag).
// Wide screens: one wheel gesture (or arrow key) plays the trip. Either way a gesture the other way while a trip plays
// turns the camera around on the spot, and on the last chapter one more gesture leaves the tour for the profile
// sections, which scroll normally.
export function TourChapters({ variant, active, prefs, flight, email }: Props) {
  const desktop = variant === "desktop";
  const stage = useRef<HTMLDivElement>(null);
  const videoA = useRef<HTMLVideoElement>(null);
  const videoB = useRef<HTMLVideoElement>(null);
  const layerA = useRef<HTMLImageElement>(null);
  const layerB = useRef<HTMLImageElement>(null);
  const ctrl = useRef<TourController | null>(null);
  const [st, setSt] = useState<TourState>(initial);
  const [swiped, setSwiped] = useState(false);
  const animated = !prefs.stills;

  useEffect(() => {
    if (!active || !videoA.current || !videoB.current || !layerA.current || !layerB.current) return;
    const c = new TourController({
      videos: [videoA.current, videoB.current],
      layers: [layerA.current, layerB.current],
      ...tourAssets[variant],
      device: variant,
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
  }, [active, animated, variant]);

  // Gestures: touch swipes, the wheel and the arrow keys.
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
      if (!c.step(dir)) leave();
    };

    // Touch: once the finger has clearly moved, the trip follows it (a full trip = 70 % of the screen height).
    // On release it finishes on its own if it went a quarter of the way (unless the finger was flicking back) or the
    // flick was fast enough in that direction; otherwise it springs back to the scene it left. When following is not
    // possible (a trip already
    // playing, the edge of the tour, still images, video not downloaded yet), the gesture is a plain swipe.
    let y0 = 0;
    let t0 = 0;
    let dir: 0 | 1 | -1 = 0;
    let dragging = false;
    let lastY = 0;
    let lastT = 0;
    let velocity = 0; // px/ms, positive = finger moving up
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      y0 = lastY = e.touches[0].clientY;
      t0 = lastT = performance.now();
      dir = 0;
      dragging = false;
      velocity = 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const c = ctrl.current;
      if (!c || e.touches.length !== 1) return;
      const y = e.touches[0].clientY;
      const now = performance.now();
      if (now > lastT) velocity = 0.7 * velocity + 0.3 * ((lastY - y) / (now - lastT));
      lastY = y;
      lastT = now;
      const dy = y0 - y;
      if (!dir && Math.abs(dy) > 10) {
        dir = dy > 0 ? 1 : -1;
        // Wide screens only play trips (their files have a long keyframe interval): a touch there is a plain swipe.
        if (window.scrollY <= 4 && !desktop) {
          dragging = c.dragBegin(dir);
          if (dragging) setSwiped(true);
        }
      }
      if (dragging) c.dragTo((dir * dy - 10) / (window.innerHeight * 0.7));
    };
    const onTouchEnd = (e: TouchEvent) => {
      const c = ctrl.current;
      const dy = y0 - (e.changedTouches[0]?.clientY ?? y0);
      if (dragging && c) {
        dragging = false;
        const progress = (dir * dy - 10) / (window.innerHeight * 0.7);
        const along = dir * velocity; // > 0: finger still moving the way of the trip at release
        c.dragEnd(along > 0.35 || (progress > 0.25 && along > -0.35));
        return;
      }
      const fast = Math.abs(dy) / Math.max(1, performance.now() - t0) > 0.4; // a flick counts even if short
      if (Math.abs(dy) < 40 && !(fast && Math.abs(dy) > 16)) return;
      step(dy > 0 ? 1 : -1);
    };

    // One wheel gesture = one step, however long it runs: a gesture is a run of wheel events with no pause of 220 ms
    // or more (a hard spin of the wheel and the inertia of a trackpad are one gesture), and it moves the tour once.
    // Counting a step every so often inside a long gesture used to run through the chapters, and out of the tour,
    // on crossfades before their trips had even arrived. A new gesture right after a step (under 900 ms) is still
    // the inertia of the previous one. A gesture that began while the page was scrolled (coming back up from the
    // sections) belongs to the page until it ends, so its inertia does not step back through the chapters.
    let lastWheel = 0;
    let lastStep = 0;
    let ownGesture = false;
    let stepped = false;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch zoom
      const now = performance.now();
      if (now - lastWheel > 220) {
        ownGesture = window.scrollY <= 4;
        stepped = false;
      }
      lastWheel = now;
      if (!ownGesture || window.scrollY > 4) return; // let the page scroll normally while the tour is not fully in view
      e.preventDefault();
      if (stepped || Math.abs(e.deltaY) < 8) return;
      stepped = true;
      if (now - lastStep < 900) return;
      lastStep = now;
      step(e.deltaY > 0 ? 1 : -1);
    };

    // While the tour is the whole screen the page itself must not scroll: a wheel event that arrives late (the page
    // is busy playing a trip), the End key or the scrollbar would otherwise carry the visitor past the tour. The tour
    // moves by its own gestures and leaves through leave() (scripts can still scroll a locked page).
    const root = document.documentElement;
    const lock = () => {
      const y = window.scrollY;
      if (y > 0 && y <= 4) window.scrollTo({ top: 0, behavior: "instant" });
      if (desktop) root.classList.toggle("tour-lock", y <= 4);
    };
    lock();
    window.addEventListener("scroll", lock, { passive: true });

    const onKey = (e: KeyboardEvent) => {
      if (window.scrollY > 4 || e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t && t.closest("input, textarea, select, button, a, [contenteditable]")) return;
      // A held key repeats: it must not run through the chapters.
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        if (!e.repeat) step(1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        if (!e.repeat) step(-1);
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });
    // On the window, not the stage: the menu island floats above it, and a wheel over it should step the tour too.
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", lock);
      root.classList.remove("tour-lock");
    };
  }, [active, desktop]);

  // Copy: hidden while a trip plays (except over the intro); the next chapter's comes in as the camera settles there.
  const shown = st.moving ? (st.chapter === 0 && st.target === 0 ? 0 : st.settling ? st.target : -1) : st.chapter;
  const atRest = !st.moving;

  return (
    <div
      ref={stage}
      // touch-none: the swipe moves between chapters instead of scrolling the page.
      className="bg-bg relative h-svh touch-none overflow-hidden select-none"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- crossfade layers driven by the controller */}
      <img ref={layerA} src={tourAssets[variant].start} alt="" className="tour-layer is-on" style={{ zIndex: 2 }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={layerB} alt="" className="tour-layer" />
      <video ref={videoA} className="tour-video" muted playsInline preload="auto" aria-hidden />
      <video ref={videoB} className="tour-video" muted playsInline preload="auto" aria-hidden />

      {/* Legibility backing for the copy: at the bottom on phones, on the left on wide screens. */}
      <div
        className={
          desktop
            ? "from-bg via-bg/75 pointer-events-none absolute inset-y-0 left-0 z-[4] w-[min(64vw,880px)] bg-linear-to-r to-transparent"
            : "from-bg via-bg/80 pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-3/4 bg-linear-to-t to-transparent"
        }
      />

      <div
        aria-live="polite"
        className={
          desktop
            ? "absolute inset-y-0 left-0 z-[5] w-[min(54vw,680px)]"
            : "absolute inset-x-4 bottom-24 z-[5]"
        }
      >
        {flight.scenes.map((scene, i) => (
          <div
            key={scene.label}
            aria-hidden={shown !== i}
            inert={shown !== i}
            className={`tour-copy absolute ${
              desktop ? "top-1/2 right-0 left-[clamp(24px,6vw,112px)] -translate-y-1/2" : "inset-x-0 bottom-0"
            } ${shown === i ? "is-on" : "pointer-events-none"}`}
          >
            <ChapterCopy
              scene={scene}
              index={i}
              total={scenes.length}
              accent={scenes[i].accent}
              compact={!desktop}
              cta={i === LAST ? { ...flight.finalCta, email } : undefined}
            />
          </div>
        ))}
      </div>

      {/* Gesture hint: first chapter until the first gesture, and on the last chapter. */}
      <div
        aria-hidden
        className={`text-muted pointer-events-none absolute inset-x-0 bottom-6 z-[5] flex items-center gap-2 text-xs font-semibold tracking-widest uppercase transition-opacity duration-500 ease-fluid ${
          desktop ? "justify-start pl-[clamp(24px,6vw,112px)]" : "justify-center"
        } ${
          atRest && ((st.chapter === 0 && !swiped) || st.chapter === LAST) ? "opacity-100" : "opacity-0"
        }`}
      >
        {desktop
          ? st.chapter === LAST
            ? flight.more
            : flight.scrollHint
          : st.chapter === LAST
            ? flight.swipeLast
            : flight.swipe}
        {desktop ? (
          <ArrowDown size={14} weight="bold" className="sw-bounce" />
        ) : (
          <ArrowUp size={14} weight="bold" className="sw-bounce" />
        )}
      </div>

      {/* Chapter dots. */}
      <nav
        aria-label={flight.summaryLabel}
        className={`absolute top-1/2 z-[6] flex -translate-y-1/2 flex-col ${desktop ? "right-6" : "right-2"}`}
      >
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

      <div
        className={`pointer-events-none absolute z-[6] flex flex-col items-end gap-2 ${
          desktop ? "right-6 bottom-6 w-[28rem] max-w-[calc(100%-3rem)]" : "inset-x-4 top-24"
        }`}
      >
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
