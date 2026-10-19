// Chapter tour player (phones). Framework free: the React layout owns the DOM and calls step / goTo.
//
// Each chapter rests on a still image (the exact last frame of its trips). Moving one chapter forward or back plays
// a short trip video natively (never scrubbed): forward trips run from one rest frame to the next, return trips are
// the same frames in reverse. If the visitor changes direction mid trip, the other video takes over at the mirrored
// time, so the camera turns around on the spot. Jumping several chapters at once is a crossfade between stills.
//
// While the finger is down (drag*), the trip follows it frame by frame; on release it either finishes playing on its
// own to the next chapter, or turns around and plays back to where it started.
//
// Layers, bottom to top: two still images that alternate for crossfades, then two trip videos that alternate so
// one can be loaded and positioned while the other is still showing.

export type TourState = {
  chapter: number; // chapter at rest, or the one the current trip departed from
  moving: boolean; // a trip is playing
  target: number; // chapter the current trip goes to (equals chapter at rest and during the intro)
  loading: number | null; // trip download progress 0..1, -1 when the size is unknown, null when not waiting
};

type Options = {
  videos: [HTMLVideoElement, HTMLVideoElement];
  layers: [HTMLImageElement, HTMLImageElement];
  start: string; // poster shown before the intro plays
  intro: string; // trip into chapter 0
  trips: string[]; // trips[k]: chapter k -> k + 1
  backs: string[]; // backs[k]: chapter k + 1 -> k (trips[k] in reverse)
  rests: string[]; // still for each chapter
  animated: boolean; // false: still images only, no video downloads
  onChange: (state: TourState) => void;
};

type Drag = {
  my: number; // token of the drag session
  target: number;
  v: HTMLVideoElement;
  progress: number; // 0..1 along the trip
  prepared: boolean; // the trip video is on screen and seekable
  released: null | "finish" | "back";
  reseek: boolean; // a newer position arrived while the decoder was still seeking
};

type Download = {
  promise: Promise<string>;
  progress: number | null;
  listeners: Set<(p: number | null) => void>;
};

/**
 * Resolves on `type`; rejects on a media error or after `ms`. A video that cannot load fires nothing but `error`, so
 * waiting for its events alone hung the tour forever (seen on WebKit with blob video).
 */
const media = (v: HTMLVideoElement, type: string, ms: number) =>
  new Promise<void>((resolve, reject) => {
    const finish = (ok: boolean) => {
      window.clearTimeout(timer);
      v.removeEventListener(type, onOk);
      v.removeEventListener("error", onError);
      if (ok) resolve();
      else reject(new Error(`video ${type}`));
    };
    const onOk = () => finish(true);
    const onError = () => finish(false);
    const timer = window.setTimeout(() => finish(false), ms);
    v.addEventListener(type, onOk);
    v.addEventListener("error", onError);
  });

const delay = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

const sign = (n: number) => (n > 0 ? 1 : n < 0 ? -1 : 0);

export class TourController {
  private s: TourState = { chapter: 0, moving: false, target: 0, loading: null };
  private token = 0; // bumped to cancel whatever trip is in flight
  private pending: 0 | 1 | -1 = 0; // one step queued while a trip plays
  private front: 0 | 1; // visible still layer
  private cur: 0 | 1 = 0; // visible (or last used) video
  private downloads = new Map<string, Download>();
  private ready = new Map<string, string>(); // trip url -> object url, once fully downloaded
  private aborts: AbortController[] = [];
  private objectUrls: string[] = [];
  private timers: number[] = [];
  private alive = true;
  private drag: Drag | null = null;
  private blobVideo = true; // false once a blob URL failed to load: trips then play from their plain URL

  constructor(private o: Options) {
    for (const v of o.videos) {
      // Required for inline autoplay on iOS; React does not reliably reflect `muted` as an attribute.
      v.muted = true;
      v.playsInline = true;
      v.setAttribute("muted", "");
      v.setAttribute("playsinline", "");
    }
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
    void this.play(this.o.intro, 0, 0);
    this.later(() => this.prefetch(this.o.trips[0]), 1500);
  }

  /** One chapter forward (1) or back (-1). Returns false only for forward on the last chapter. */
  step(dir: 1 | -1): boolean {
    const { chapter, moving, target } = this.s;
    if (moving) {
      const heading = sign(target - chapter);
      if (heading === 0) {
        // intro: a forward step is queued for when it lands, a back step has nowhere to go
        if (dir > 0) this.pending = 1;
      } else if (dir === heading) {
        if ((dir > 0 && target < this.last) || (dir < 0 && target > 0)) this.pending = dir;
      } else this.turnAround();
      return true;
    }
    if (dir > 0 && chapter >= this.last) return false;
    if (dir < 0 && chapter <= 0) return true;
    if (!this.o.animated) this.jump(chapter + dir);
    else void this.play(dir > 0 ? this.o.trips[chapter] : this.o.backs[chapter - 1], chapter + dir, 0);
    return true;
  }

  /** Go to a chapter: a neighbour is a trip, anything further a crossfade. */
  goTo(i: number) {
    const { chapter, moving, target } = this.s;
    const base = moving ? target : chapter;
    if (i === base) return;
    if (Math.abs(i - base) === 1 && this.o.animated) {
      if (!moving) return void this.step(sign(i - base) as 1 | -1);
      const heading = sign(target - chapter);
      if (heading !== 0 && sign(i - base) === heading) this.pending = heading as 1 | -1;
      else if (i === chapter) this.turnAround();
      else this.jump(i);
      return;
    }
    this.jump(i);
  }

  // ---- dragging: the trip follows the finger ----

  /**
   * Start following the finger towards the next (1) or previous (-1) chapter. Returns false when that is not
   * possible right now (a trip is playing, the edge of the tour, still images, or the trip is not downloaded yet):
   * the caller then treats the gesture as a plain swipe on release.
   */
  dragBegin(dir: 1 | -1): boolean {
    const c = this.s.chapter;
    if (this.s.moving || !this.o.animated) return false;
    if ((dir > 0 && c >= this.last) || (dir < 0 && c <= 0)) return false;
    const url = dir > 0 ? this.o.trips[c] : this.o.backs[c - 1];
    const src = this.ready.get(url);
    if (!src) {
      this.prefetch(url);
      return false;
    }
    const my = ++this.token;
    this.pending = 0;
    const nextIdx = this.cur === 0 ? 1 : 0;
    const d: Drag = {
      my, target: c + dir, v: this.o.videos[nextIdx], progress: 0, prepared: false, released: null, reseek: false,
    };
    this.drag = d;
    this.set({ moving: true, target: c + dir });
    void (async () => {
      const v = d.v;
      const loaded = await this.load(v, url);
      if (my !== this.token) return;
      if (!loaded) {
        this.drag = null;
        return this.cancel();
      }
      if (Math.abs(v.currentTime) > 0.01) {
        v.currentTime = 0;
        await media(v, "seeked", 3000).catch(() => {});
      }
      if (my !== this.token) return;
      // Frame 0 is the still underneath: swapping the video in is invisible.
      const old = this.o.videos[this.cur];
      v.style.zIndex = "4";
      old.style.zIndex = "3";
      v.style.transition = "none";
      v.classList.add("is-on");
      old.classList.remove("is-on");
      old.pause();
      this.cur = nextIdx;
      d.prepared = true;
      if (d.released) this.release(d);
      else this.seekDrag(d);
    })();
    return true;
  }

  /** Finger position along the trip, 0..1. */
  dragTo(progress: number) {
    const d = this.drag;
    if (!d || d.released) return;
    d.progress = Math.min(1, Math.max(0, progress));
    this.seekDrag(d);
  }

  /** Finger lifted: finish the trip on its own, or go back to where it started. */
  dragEnd(finish: boolean) {
    const d = this.drag;
    if (!d || d.released) return;
    d.released = finish ? "finish" : "back";
    if (d.prepared) this.release(d);
  }

  private seekDrag(d: Drag) {
    if (!d.prepared || d.released || d.my !== this.token) return;
    const v = d.v;
    // Never queue a seek while the decoder is still on the previous one: catch up with the latest position after.
    if (v.seeking) {
      d.reseek = true;
      return;
    }
    const t = d.progress * v.duration * 0.999;
    if (Math.abs(v.currentTime - t) < 1 / 48) return;
    v.currentTime = t;
    v.addEventListener(
      "seeked",
      () => {
        if (d.reseek && this.drag === d) {
          d.reseek = false;
          this.seekDrag(d);
        }
      },
      { once: true },
    );
  }

  private async release(d: Drag) {
    this.drag = null;
    if (d.my !== this.token) return;
    const v = d.v;
    if (d.released === "back") {
      if (d.progress < 0.02) return this.cancel(); // barely moved: the still of origin is right there
      // A long way back plays the mirrored trip from this exact frame, when it is downloaded; anything else springs
      // back by seeking the same video, which needs no extra download.
      const mirror = d.target > this.s.chapter ? this.o.backs[this.s.chapter] : this.o.trips[d.target];
      if (d.progress > 0.3 && this.ready.has(mirror)) return this.turnAround();
      return this.rewind(d);
    }
    if (d.progress > 0.995) return void this.arrive(d.target, d.my, false);
    const ended = this.ended(v, v.currentTime);
    try {
      await v.play();
    } catch {
      if (d.my === this.token) await this.arrive(d.target, d.my, true);
      return;
    }
    const stalled = await ended;
    if (d.my === this.token) await this.arrive(d.target, d.my, stalled);
  }

  /** Spring back to frame 0 by seeking (ease out, 0.2 to 0.6 s), then rest on the still of origin. */
  private rewind(d: Drag) {
    const v = d.v;
    const from = d.progress;
    const ms = Math.min(600, 200 + from * 1000);
    const t0 = performance.now();
    const frame = (now: number) => {
      if (d.my !== this.token || !this.alive) return;
      const k = Math.min(1, (now - t0) / ms);
      const p = from * Math.pow(1 - k, 3);
      if (!v.seeking) v.currentTime = p * v.duration * 0.999;
      if (k < 1) return void requestAnimationFrame(frame);
      const done = () => d.my === this.token && this.cancel();
      if (v.seeking) v.addEventListener("seeked", done, { once: true });
      else done();
    };
    requestAnimationFrame(frame);
  }

  destroy() {
    this.alive = false;
    this.token++;
    this.timers.forEach((t) => window.clearTimeout(t));
    this.aborts.forEach((a) => a.abort());
    for (const v of this.o.videos) {
      v.pause();
      v.removeAttribute("src");
      v.load();
    }
    this.objectUrls.forEach((u) => URL.revokeObjectURL(u));
  }

  // ---- trips ----

  private async play(url: string, target: number, startAt: number) {
    const my = ++this.token;
    this.set({ moving: true, target });
    // Blob video works: download the whole trip first. Otherwise the video element loads it directly (once).
    if (this.blobVideo) {
      try {
        await this.fetch(url, (p) => my === this.token && this.set({ loading: p ?? -1 }));
      } catch {
        if (my === this.token) await this.arrive(target, my, true); // network failed: crossfade instead
        return;
      }
      if (my !== this.token || !this.alive) return;
    } else if (!this.ready.has(url)) this.set({ loading: -1 });

    // Prepare the hidden video (source, position), then swap it in on its first painted frame.
    const nextIdx = this.cur === 0 ? 1 : 0;
    const v = this.o.videos[nextIdx];
    const old = this.o.videos[this.cur];
    const loaded = await this.load(v, url);
    if (my !== this.token) return;
    this.set({ loading: null });
    if (!loaded) return void (await this.arrive(target, my, true)); // the video will not play: crossfade instead
    if (Math.abs(v.currentTime - startAt) > 0.01) {
      v.currentTime = startAt;
      await media(v, "seeked", 3000).catch(() => {});
      if (my !== this.token) return;
    }

    const painted = Promise.race([
      new Promise<void>((resolve) => {
        if ("requestVideoFrameCallback" in v) v.requestVideoFrameCallback(() => resolve());
        else window.setTimeout(resolve, 60);
      }),
      delay(250), // a hidden video may never present a frame on some engines
    ]);
    const ended = this.ended(v, startAt);
    try {
      await v.play();
    } catch {
      if (my === this.token) await this.arrive(target, my, true);
      return;
    }
    await painted;
    if (my !== this.token) {
      v.pause();
      return;
    }
    // Same picture on both sides of the swap: the still under a fresh trip, or the other video when turning around.
    v.style.zIndex = "4";
    old.style.zIndex = "3";
    v.style.transition = "none";
    v.classList.add("is-on");
    old.classList.remove("is-on");
    old.pause();
    this.cur = nextIdx;

    const stalled = await ended;
    if (my === this.token) await this.arrive(target, my, stalled);
  }

  /**
   * Put a trip on a video element and wait for its metadata. Plays the downloaded blob; where blob video fails to load
   * (WebKit), falls back to the plain URL for this and every later trip. False when the video cannot load at all.
   */
  private async load(v: HTMLVideoElement, url: string): Promise<boolean> {
    const blob = this.blobVideo ? this.ready.get(url) : undefined;
    const src = blob ?? url;
    if (v.getAttribute("src") === src && v.readyState >= 1 && !v.error) return true;
    if (v.getAttribute("src") !== src) v.src = src;
    else v.load(); // same source after an error: try again
    try {
      await media(v, "loadedmetadata", blob ? 4000 : 15000);
      return true;
    } catch {
      if (!blob || !this.alive) return false;
      this.blobVideo = false;
      return this.load(v, url);
    }
  }

  /** Resolves when the trip ends: false when it played out, true when it errored or stalled well past its length. */
  private ended(v: HTMLVideoElement, startAt = 0): Promise<boolean> {
    const left = Number.isFinite(v.duration) ? v.duration - startAt : 6;
    return media(v, "ended", left * 1000 + 4000).then(
      () => false,
      () => true,
    );
  }

  /** Change direction mid trip: the opposite video continues from the mirrored time. */
  private turnAround() {
    const { chapter: from, target: to } = this.s;
    const heading = sign(to - from);
    const opposite = heading > 0 ? this.o.backs[from] : this.o.trips[to];
    const src = opposite && this.ready.get(opposite);
    const v = this.o.videos[this.cur];
    if (!src || !Number.isFinite(v.duration)) return this.cancel(); // not downloaded yet: go back with a fade
    const at = Math.max(0, v.duration - v.currentTime);
    this.pending = 0;
    this.set({ chapter: to }); // the trip now departs from where it was heading
    void this.play(opposite, from, at);
  }

  private async arrive(target: number, my: number, fade: boolean) {
    // The video stays on top showing its last frame while the identical still is put underneath.
    await this.show(this.o.rests[target], fade);
    if (my !== this.token) return;
    this.hideVideos(false);
    this.set({ chapter: target, moving: false, target, loading: null });
    this.prefetchAround(target);
    const queued = this.pending;
    this.pending = 0;
    if (queued) this.step(queued);
  }

  private jump(i: number) {
    this.token++;
    this.pending = 0;
    this.set({ chapter: i, moving: false, target: i, loading: null });
    void this.show(this.o.rests[i], true).then(() => this.hideVideos(true));
    this.prefetchAround(i);
  }

  private cancel() {
    // The intro has no still of origin underneath (only the poster), so cancelling it lands on chapter 0.
    if (this.s.target === this.s.chapter) return this.jump(this.s.chapter);
    this.token++;
    this.pending = 0;
    this.hideVideos(true); // the still of the chapter of origin is still underneath
    this.set({ moving: false, target: this.s.chapter, loading: null });
  }

  private hideVideos(fade: boolean) {
    for (const v of this.o.videos) {
      v.pause();
      v.style.transition = fade ? "opacity 250ms ease-out" : "none";
      v.classList.remove("is-on");
    }
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

  private prefetchAround(k: number) {
    this.preloadStills(k);
    if (!this.o.animated) return;
    this.prefetch(this.o.trips[k]); // next
    this.prefetch(this.o.backs[k - 1]); // previous
    // The mirrors of those two, needed when a drag is released short of halfway and plays back, and the trip after
    // next, in case of a queued step.
    this.later(() => {
      this.prefetch(this.o.backs[k]);
      this.prefetch(this.o.trips[k - 1]);
      this.prefetch(this.o.trips[k + 1]);
    }, 1500);
  }

  /** Background download; past either end of the tour there is simply nothing to fetch. Skipped while the visitor
   *  reads the sections below (the tour is scrolled away), so their images are not stuck behind unseen clips. */
  private prefetch(url: string | undefined) {
    // Without blob video the element loads each trip itself: a background download would only fetch it twice.
    if (!url || !this.blobVideo || window.scrollY > window.innerHeight / 2) return;
    this.fetch(url).catch(() => {});
  }

  // Whole file as a blob: plays instantly once here and never stalls halfway on a slow connection.
  private fetch(url: string, onProgress?: (p: number | null) => void): Promise<string> {
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
        this.ready.set(url, objectUrl);
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
