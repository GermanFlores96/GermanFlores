// Anonymous measurements of the tour, so "it hangs" or "it takes long" becomes numbers: per trip, how long the visitor
// waited, whether it played or became a crossfade, how many times playback stalled, which encoding and tier were used
// and what the connection looked like. Sent in small batches with sendBeacon to /api/tour-metric, which writes one
// line per event to the server logs. No cookie, no identifier, nothing stored in the browser.

export type TourEvent = {
  kind: "intro" | "trip";
  codec: string; // av1 | hevc | h264
  tier: "normal" | "lite";
  out: "video" | "fade" | "error" | "skipped"; // what the visitor got
  waitMs: number | null; // from the request to the first frame (video) or to giving up (fade)
  kb: number | null; // size of the file when it was downloaded
  stalls: number; // times playback ran dry while the trip played
  mbps: number | null; // measured connection speed at that moment
};

type Connection = EventTarget & { effectiveType?: string; downlink?: number; saveData?: boolean };
const connection = () => (navigator as Navigator & { connection?: Connection }).connection;

const FLUSH_AT = 8;

export class TourMetrics {
  private events: TourEvent[] = [];
  private readonly onHide = () => {
    if (document.visibilityState === "hidden") this.flush();
  };

  constructor(private device: "phone" | "desktop") {
    document.addEventListener("visibilitychange", this.onHide);
    window.addEventListener("pagehide", this.onHide);
  }

  record(e: TourEvent) {
    // `?tourdebug` in the address: also show each event in the console (and keep them in window.__tour).
    if (location.search.includes("tourdebug")) {
      console.info("[tour]", e);
      const w = window as unknown as { __tour?: TourEvent[] };
      (w.__tour ??= []).push(e);
    }
    this.events.push(e);
    if (this.events.length >= FLUSH_AT) this.flush();
  }

  flush() {
    if (!this.events.length) return;
    const c = connection();
    const body = JSON.stringify({
      device: this.device,
      net: { type: c?.effectiveType, downlink: c?.downlink, save: c?.saveData },
      events: this.events.splice(0),
    });
    try {
      navigator.sendBeacon?.("/api/tour-metric", new Blob([body], { type: "text/plain" }));
    } catch {
      /* measurements are best effort */
    }
  }

  destroy() {
    this.flush();
    document.removeEventListener("visibilitychange", this.onHide);
    window.removeEventListener("pagehide", this.onHide);
  }
}
