"use client";

import { TourChapters } from "./TourChapters";
import { ScrollWorld } from "@/components/scroll-world/ScrollWorld";
import { useMedia, useMotionPrefs } from "@/lib/motion";
import { DESKTOP_TOUR } from "@/content/shared";
import type { Dictionary } from "@/content/types";

type Props = { flight: Dictionary["flight"]; email: string };

// Both screens play the tour a chapter at a time (see TourChapters). With DESKTOP_TOUR = "scrub", wide screens keep
// the earlier full screen scroll tour instead. Both are server rendered and CSS shows one of them; only the visible
// one starts, so a page never downloads both sets of videos.
export function Tour({ flight, email }: Props) {
  const prefs = useMotionPrefs();
  const wide = useMedia("(min-width: 1024px)");

  return (
    <section id="recorrido" aria-label={flight.summaryLabel}>
      <div className="lg:hidden">
        <TourChapters variant="phone" active={prefs.ready && !wide} prefs={prefs} flight={flight} email={email} />
      </div>
      <div className="hidden lg:block">
        {DESKTOP_TOUR === "chapters" ? (
          <TourChapters variant="desktop" active={prefs.ready && wide} prefs={prefs} flight={flight} email={email} />
        ) : (
          <ScrollWorld
            enabled={wide}
            copy={flight.scenes}
            hint={flight.hint}
            skip={flight.skip}
            summaryLabel={flight.summaryLabel}
            loading={flight.loading}
            more={flight.more}
            motion={flight.motion}
            cta={flight.finalCta}
            email={email}
          />
        )}
      </div>
    </section>
  );
}
