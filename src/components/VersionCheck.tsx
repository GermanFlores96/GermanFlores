"use client";

import { useEffect } from "react";

const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID;
const RELOADED_KEY = "sw-reloaded-for";

// Browsers (Safari on iPhone above all) keep tabs and restored pages alive with the code they loaded, so someone
// who opened the site before a deployment can keep seeing the old version. When the tab becomes visible again or
// is restored from the back/forward cache, ask the server which deployment is live and reload if it is newer.
export function VersionCheck() {
  useEffect(() => {
    if (!BUILD_ID || BUILD_ID === "local") return;
    let checking = false;

    const check = async () => {
      if (checking || document.visibilityState !== "visible") return;
      checking = true;
      try {
        const response = await fetch("/version", { cache: "no-store" });
        const latest = (await response.text()).trim();
        if (!response.ok || !latest || latest === BUILD_ID) return;
        // One reload per live version: if a stale edge answered once, never loop.
        if (sessionStorage.getItem(RELOADED_KEY) === latest) return;
        sessionStorage.setItem(RELOADED_KEY, latest);
        window.location.reload();
      } catch {
        /* offline or blocked: try again the next time the tab is shown */
      } finally {
        checking = false;
      }
    };

    const onPageShow = (event: PageTransitionEvent) => event.persisted && check();
    document.addEventListener("visibilitychange", check);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("focus", check);
    return () => {
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("focus", check);
    };
  }, []);

  return null;
}
