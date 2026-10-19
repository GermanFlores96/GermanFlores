"use client";

import { useSyncExternalStore } from "react";
import { MOTION_CHOICE } from "@/content/shared";

// The tour is animated for everyone by default: the video never plays on its own, it only moves when the visitor
// asks for the next scene. Many systems report `prefers-reduced-motion` without the person knowing (Windows with
// animations off, power saver, remote desktop), so that signal alone must not turn the main experience into still
// images. People who do want less motion get a visible choice, remembered for the session (sessionStorage, not a
// cookie). Data saver is different: it is an explicit request to spend less data, so those visitors start with the
// still images (no video downloads) and can turn the animation on.
// With MOTION_CHOICE off (content/shared.ts) none of this applies: everyone gets the animated tour and no notice.
const REDUCED = "(prefers-reduced-motion: reduce)";
const CHOICE_KEY = "sw-motion";
const CHOICE_EVENT = "sw-motion-change";
export type MotionChoice = "still" | "animated" | "ack" | null;

const subscribeReduced = (notify: () => void) => {
  const query = window.matchMedia(REDUCED);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
const readReduced = () => window.matchMedia(REDUCED).matches;

// Network Information API: Chromium browsers only; elsewhere it is simply absent and the videos load as usual.
type NetworkInfo = EventTarget & { saveData?: boolean; effectiveType?: string };
const connection = () => (navigator as Navigator & { connection?: NetworkInfo }).connection;
const subscribeLowData = (notify: () => void) => {
  const c = connection();
  c?.addEventListener("change", notify);
  return () => c?.removeEventListener("change", notify);
};
const readLowData = () => {
  const c = connection();
  return Boolean(c?.saveData) || c?.effectiveType === "slow-2g" || c?.effectiveType === "2g";
};

const subscribeNever = () => () => {};

const subscribeChoice = (notify: () => void) => {
  window.addEventListener(CHOICE_EVENT, notify);
  return () => window.removeEventListener(CHOICE_EVENT, notify);
};
const readChoice = (): MotionChoice => {
  try {
    const value = sessionStorage.getItem(CHOICE_KEY);
    return value === "still" || value === "animated" || value === "ack" ? value : null;
  } catch {
    return null;
  }
};

export const writeChoice = (choice: MotionChoice) => {
  try {
    if (choice) sessionStorage.setItem(CHOICE_KEY, choice);
    else sessionStorage.removeItem(CHOICE_KEY);
  } catch {
    /* private mode: the choice just lasts until the next load */
  }
  window.dispatchEvent(new Event(CHOICE_EVENT));
};

/** Media query as an external store; `false` during server render and hydration. */
export function useMedia(query: string) {
  return useSyncExternalStore(
    (notify) => {
      const q = window.matchMedia(query);
      q.addEventListener("change", notify);
      return () => q.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function useMotionPrefs() {
  const reduced = useSyncExternalStore(subscribeReduced, readReduced, () => false);
  const choice = useSyncExternalStore(subscribeChoice, readChoice, () => null);
  const lowData = useSyncExternalStore(subscribeLowData, readLowData, () => false);
  // False during server render and hydration, true once the real client values above are known. Players wait
  // for it, otherwise they would start downloading with the server defaults and then restart.
  const ready = useSyncExternalStore(subscribeNever, () => true, () => false);
  const stills = MOTION_CHOICE && (choice === "still" || (lowData && choice !== "animated"));
  return { reduced, choice, lowData, ready, stills };
}
