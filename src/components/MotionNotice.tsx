"use client";

import { writeChoice, type MotionChoice } from "@/lib/motion";
import { MOTION_CHOICE } from "@/content/shared";
import type { Dictionary } from "@/content/types";

type Props = {
  motion: Dictionary["flight"]["motion"];
  reduced: boolean;
  choice: MotionChoice;
  stills: boolean;
  className?: string;
};

const buttonClass =
  "min-h-12 rounded-lg px-3 py-2 text-base font-semibold transition-all duration-700 ease-fluid active:scale-[0.98]";

// Notice states: showing still images (data saver, or chosen) offers the animation back; a reduced motion system
// with the animation running offers the still images until the visitor answers. Everyone else sees nothing.
export function MotionNotice({ motion, reduced, choice, stills, className = "" }: Props) {
  if (!MOTION_CHOICE) return null;
  const notice = stills
    ? choice === "still"
      ? motion.noticeStill
      : motion.noticeLowData
    : reduced && choice === null
      ? motion.noticeAnimated
      : null;
  if (!notice) return null;

  return (
    <div
      role="region"
      aria-label={notice}
      className={`border-line bg-surface/90 pointer-events-auto flex w-full flex-col items-start gap-3 rounded-2xl border p-4 backdrop-blur-xl ${className}`}
    >
      <p className="text-muted text-sm">{notice}</p>
      <div className="flex flex-wrap gap-2">
        {stills ? (
          <button
            type="button"
            onClick={() => writeChoice("animated")}
            className={`${buttonClass} bg-violet hover:bg-violet-soft text-white`}
          >
            {motion.toAnimated}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => writeChoice("still")}
              className={`${buttonClass} border-line hover:bg-ink/10 border`}
            >
              {motion.toStill}
            </button>
            <button
              type="button"
              onClick={() => writeChoice("ack")}
              className={`${buttonClass} bg-violet hover:bg-violet-soft text-white`}
            >
              {motion.dismiss}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
