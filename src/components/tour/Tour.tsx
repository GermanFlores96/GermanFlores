"use client";

import { TourMobile } from "./TourMobile";
import { ScrollWorld } from "@/components/scroll-world/ScrollWorld";
import { useMedia, useMotionPrefs } from "@/lib/motion";
import type { Dictionary } from "@/content/types";

type Props = { flight: Dictionary["flight"]; email: string };

// Phones get the chapter tour (TikTok style); wide screens keep the full screen scroll tour, which suits the look of
// the site there. Both are server rendered and CSS shows one of them; only the visible one starts, so a page never
// downloads both sets of videos.
export function Tour({ flight, email }: Props) {
  const prefs = useMotionPrefs();
  const wide = useMedia("(min-width: 1024px)");

  return (
    <section id="recorrido" aria-label={flight.summaryLabel}>
      <div className="lg:hidden">
        <TourMobile active={prefs.ready && !wide} prefs={prefs} flight={flight} email={email} />
      </div>
      <div className="hidden lg:block">
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
      </div>
    </section>
  );
}
