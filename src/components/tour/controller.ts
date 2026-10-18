// Chapter tour player. Framework free: the React layouts own the DOM and call next / prev / goTo.
//
// Each chapter rests on a still image (the exact last frame of its trip). Moving forward plays a short trip video
// (2 to 3 s, natively, never scrubbed) that starts on the current still and ends on the next one. Moving back, or
// jumping several chapters, is a quick crossfade between stills: the camera never runs backwards.
//
// Layers, bottom to top: two still images that alternate for crossfades, then the trip video.

export type TourState = {
  chapter: number; // chapter at rest (or the one a trip departed from)
  moving: boolean; // a trip is playing
  target: number; // chapter the current trip goes to (equals chapter when at rest)
  loading: number | null; // trip download progress 0..1, -1 when the size is unknown, null when not waiting
};

type Options = {
  video: HTMLVideoElement;
  layers: [HTMLImageElement, HTMLImageElement];
  start: string; // poster shown before the intro plays
  intro: string; // trip into chapter 0
  trips: string[]; // trips[k] goes from chapter k to chapter k + 1
  rests: string[]; // still for each chapter
  animated: boolean; // false: still images only, no video downloads
  onChange: (state: TourState) => void;
};

type Download = {
  promise: Promise<string>;
  progress: number | null;
  listeners: Set<(p: number | null) => void>;
};

export class TourController {
  private s: TourState = { chapter: 0, moving: false, target: 0, loading: null };
  private token = 0; // bumped to cancel whatever trip is in flight
  private pendingNext = false; // one forward step queued while a trip plays
  private front: 0 | 1;
  private downloads = new Map<string, Download>();
  private aborts: AbortController[] = [];
  private objectUrls: string[] = [];
  private timers: number[] = [];
  private alive = true;

  constructor(private o: Options) {
    const v = o.video;
    // Required for inline autoplay on iOS; React does not reliably reflect `muted` as an attribute.
    v.muted = true;
    v.playsInline = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    this.front = o.layers[1].classList.contains("is-on") ? 1 : 0;
  }

  get state() {
    return this.s;
  }

  get last() {
    return this.o.rests.length - 1;
  }

  private set(patch: Partial<TourState>) {
    this.s = { ...this.s, ...patch };
    this.o.onChange(this.s);
  }

  async start() {
    this.preloadStills(0);
    if (!this.o.animated) {
      await this.show(this.o.rests[0], false);
      return;
    }
    await this.show(this.o.start, false);
    void this.play(this.o.intro, 0);
    this.later(() => this.fetchTrip(0), 1200);
  }

  /** Forward one chapter. Returns false on the last chapter, so the caller can leave the tour. */
  next(): boolean {
    if (this.s.moving) {
      if (this.s.target < this.last) this.pendingNext = true;
      return true;
    }
    const k = this.s.chapter;
    if (k >= this.last) return false;
    if (!this.o.animated) this.jump(k + 1);
    else void this.play(this.o.trips[k], k + 1);
    return true;
  }

  /** Back one chapter: during a trip it cancels and stays where it was; at rest it crossfades. */
  prev() {
    if (this.s.moving) return this.cancel();
    if (this.s.chapter > 0) this.jump(this.s.chapter - 1);
  }

  /** Go to a chapter: the next one plays its trip, anything else crossfades. */
  goTo(i: number) {
    const base = this.s.moving ? this.s.target : this.s.chapter;
    if (i === base) return;
    if (i === base + 1 && this.o.animated) {
      this.next();
      return;
    }
    this.jump(i);
  }

  destroy() {
    this.alive = false;
    this.token++;
    this.timers.forEach((t) => window.clearTimeout(t));
    this.aborts.forEach((a) => a.abort());
    const v = this.o.video;
    v.pause();
    v.removeAttribute("src");
    v.load();
    this.objectUrls.forEach((u) => URL.revokeObjectURL(u));
  }

  // ---- trips ----

  private async play(url: string, target: number) {
    const my = ++this.token;
    this.set({ moving: true, target });
    let src: string;
    try {
      src = await this.fetchVideo(url, (p) => my === this.token && this.set({ loading: p ?? -1 }));
    } catch {
      if (my === this.token) await this.arrive(target, my, true); // network failed: crossfade instead
      return;
    }
    if (my !== this.token || !this.alive) return;
    this.set({ loading: null });

    const v = this.o.video;
    if (v.getAttribute("src") !== src) v.src = src;
    try {
      v.currentTime = 0;
    } catch {
      /* not seekable yet: it starts at 0 anyway */
    }
    // Hidden until it really plays; its first frame is the still underneath, so showing it is invisible.
    v.addEventListener("playing", () => my === this.token && v.classList.add("is-on"), { once: true });
    const ended = new Promise<void>((resolve) => v.addEventListener("ended", () => resolve(), { once: true }));
    try {
      await v.play();
    } catch {
      if (my === this.token) await this.arrive(target, my, true);
      return;
    }
    await ended;
    if (my === this.token) await this.arrive(target, my, false);
  }

  private async arrive(target: number, my: number, fade: boolean) {
    // The video stays on top showing its last frame while the identical still is put underneath.
    await this.show(this.o.rests[target], fade);
    if (my !== this.token) return;
    this.o.video.classList.remove("is-on");
    this.set({ chapter: target, moving: false, target, loading: null });
    this.preloadStills(target);
    this.fetchTrip(target);
    this.later(() => this.fetchTrip(target + 1), 1500);
    if (this.pendingNext) {
      this.pendingNext = false;
      this.next();
    }
  }

  private jump(i: number) {
    this.token++;
    this.pendingNext = false;
    this.o.video.pause();
    this.o.video.classList.remove("is-on");
    this.set({ chapter: i, moving: false, target: i, loading: null });
    void this.show(this.o.rests[i], true);
    this.preloadStills(i);
    this.fetchTrip(i);
  }

  private cancel() {
    // The intro has no still of origin underneath (only the poster), so cancelling it lands on chapter 0.
    if (this.s.target === this.s.chapter) return this.jump(this.s.chapter);
    this.token++;
    this.pendingNext = false;
    this.o.video.pause();
    this.o.video.classList.remove("is-on"); // the still of the chapter of origin is still underneath
    this.set({ moving: false, target: this.s.chapter, loading: null });
  }

  // ---- stills ----

  private async show(url: string, fade: boolean) {
    const [a, b] = this.o.layers;
    const cur = this.front === 0 ? a : b;
    const nxt = this.front === 0 ? b : a;
    if (cur.getAttribute("src") === url && cur.classList.contains("is-on")) return;
    nxt.classList.toggle("no-fade", !fade);
    if (nxt.getAttribute("src") !== url) nxt.src = url;
    try {
      await nxt.decode();
    } catch {
      /* broken or blocked image: show what we have */
    }
    nxt.style.zIndex = "2";
    cur.style.zIndex = "1";
    nxt.classList.add("is-on");
    this.front = this.front === 0 ? 1 : 0;
    // The new still fades in over the old one, which only goes away once covered.
    if (fade) this.later(() => cur.classList.remove("is-on"), 320);
    else cur.classList.remove("is-on");
  }

  private preloadStills(k: number) {
    for (const i of [k - 1, k, k + 1]) {
      const url = this.o.rests[i];
      if (url) new Image().src = url;
    }
  }

  // ---- downloads ----

  private fetchTrip(k: number) {
    if (!this.o.animated || k < 0 || k >= this.o.trips.length) return;
    this.fetchVideo(this.o.trips[k]).catch(() => {});
  }

  // Whole file as a blob: plays instantly once here and never stalls halfway on a slow connection.
  private fetchVideo(url: string, onProgress?: (p: number | null) => void): Promise<string> {
    let d = this.downloads.get(url);
    if (!d) {
      const ctrl = new AbortController();
      this.aborts.push(ctrl);
      const entry: Download = { progress: null, listeners: new Set(), promise: Promise.resolve("") };
      entry.promise = (async () => {
        const r = await fetch(url, { signal: ctrl.signal });
        if (!r.ok) throw new Error(`http ${r.status}`);
        const total = Number(r.headers.get("Content-Length")) || 0;
        let blob: Blob;
        if (!r.body || !total) {
          blob = await r.blob();
        } else {
          const reader = r.body.getReader();
          const chunks: Uint8Array[] = [];
          let got = 0;
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            got += value.length;
            entry.progress = Math.min(1, got / total);
            entry.listeners.forEach((l) => l(entry.progress));
          }
          blob = new Blob(chunks as BlobPart[], { type: "video/mp4" });
        }
        const objectUrl = URL.createObjectURL(blob);
        this.objectUrls.push(objectUrl);
        return objectUrl;
      })();
      entry.promise.catch(() => this.downloads.delete(url)); // a later request retries
      this.downloads.set(url, entry);
      d = entry;
    }
    if (onProgress) {
      const entry = d;
      entry.listeners.add(onProgress);
      onProgress(entry.progress);
      entry.promise.finally(() => entry.listeners.delete(onProgress)).catch(() => {});
    }
    return d.promise;
  }

  private later(fn: () => void, ms: number) {
    this.timers.push(window.setTimeout(() => this.alive && fn(), ms));
  }
}
