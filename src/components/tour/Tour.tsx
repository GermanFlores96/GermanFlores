"use client";

import { TourDesktop } from "./TourDesktop";
import { TourMobile } from "./TourMobile";
import { useMedia, useMotionPrefs } from "@/lib/motion";
import type { Dictionary } from "@/content/types";

type Props = { flight: Dictionary["flight"]; email: string };

// Both layouts are server rendered (real text for search engines and no flash on load); CSS shows one of them and
// only the visible one starts its player, so a page never downloads both sets of videos.
export function Tour({ flight, email }: Props) {
  const prefs = useMotionPrefs();
  const wide = useMedia("(min-width: 1024px)");

  return (
    <section id="recorrido" aria-label={flight.summaryLabel}>
      <div className="lg:hidden">
        <TourMobile active={prefs.ready && !wide} prefs={prefs} flight={flight} email={email} />
      </div>
      <div className="hidden lg:block">
        <TourDesktop active={prefs.ready && wide} prefs={prefs} flight={flight} email={email} />
      </div>
    </section>
  );
}
