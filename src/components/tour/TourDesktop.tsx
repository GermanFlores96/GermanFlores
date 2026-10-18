"use client";

import { useEffect, useRef, useState } from "react";
import { Mouse } from "@phosphor-icons/react";
import { ChapterCopy } from "./ChapterCopy";
import { TourController, type TourState } from "./controller";
import { TourLoading } from "./TourMobile";
import { MotionNotice } from "@/components/MotionNotice";
import type { useMotionPrefs } from "@/lib/motion";
import { scenes, tourAssets } from "@/content/shared";
import type { Dictionary } from "@/content/types";

type Props = {
  active: boolean; // mounted and visible (wide screen): only then does it load and play anything
  prefs: ReturnType<typeof useMotionPrefs>;
  flight: Dictionary["flight"];
  email: string;
};

const assets = tourAssets("d");
const LAST = scenes.length - 1;
const initial: TourState = { chapter: 0, moving: false, target: 0, loading: null };

// Wide screens: the page scrolls normally. Chapter texts run down the left column; the video stays fixed on the
// right and plays the trip to each chapter as its text reaches the middle of the screen. Scrolling back up, or
// jumping several chapters at once, crossfades instead: the camera never runs backwards.
export function TourDesktop({ active, prefs, flight, email }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const layerA = useRef<HTMLImageElement>(null);
  const layerB = useRef<HTMLImageElement>(null);
  const articles = useRef<(HTMLElement | null)[]>([]);
  const ctrl = useRef<TourController | null>(null);
  const [st, setSt] = useState<TourState>(initial);
  const [current, setCurrent] = useState(0); // chapter whose text is in the middle of the screen
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

  // The chapter crossing the horizontal middle line of the viewport is the current one.
  useEffect(() => {
    if (!active) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = Number((entry.target as HTMLElement).dataset.chapter);
          setCurrent(i);
          ctrl.current?.goTo(i);
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    articles.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [active]);

  return (
    <div className="mx-auto grid max-w-screen-2xl grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-16 px-10">
      <div>
        {flight.scenes.map((scene, i) => (
          <article
            key={scene.label}
            ref={(el) => {
              articles.current[i] = el;
            }}
            data-chapter={i}
            className={`flex min-h-svh flex-col justify-center py-24 transition-opacity duration-700 ease-fluid ${
              current === i ? "opacity-100" : "opacity-35"
            }`}
          >
            <ChapterCopy
              scene={scene}
              index={i}
              total={scenes.length}
              accent={scenes[i].accent}
              cta={i === LAST ? { ...flight.finalCta, email } : undefined}
            />
            {i === 0 ? (
              <p className="text-muted mt-12 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
                <Mouse size={16} aria-hidden className="sw-bounce" />
                {flight.scrollHint}
              </p>
            ) : null}
          </article>
        ))}
      </div>

      <div className="relative">
        <div className="sticky top-0 flex h-svh flex-col justify-center gap-4 py-24">
          <div className="border-line bg-bg relative aspect-video w-full overflow-hidden rounded-2xl border">
            {/* eslint-disable-next-line @next/next/no-img-element -- crossfade layers driven by the controller */}
            <img ref={layerA} src={assets.start} alt="" className="tour-layer is-on" style={{ zIndex: 2 }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={layerB} alt="" className="tour-layer" />
            <video ref={video} className="tour-video" muted playsInline preload="none" aria-hidden />
            <TourLoading label={flight.loading} loading={st.loading} />
          </div>
          <MotionNotice motion={flight.motion} reduced={prefs.reduced} choice={prefs.choice} stills={prefs.stills} />
        </div>
      </div>
    </div>
  );
}
