"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Milliseconds, to stagger siblings. */
  delay?: number;
};

// Heavy fade up as the element enters the viewport. Driven by IntersectionObserver, never a scroll listener.
export function Reveal({ children, className = "", delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.shown = "true";
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.shown = "true";
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal translate-y-16 opacity-0 blur-md transition-all duration-[900ms] ease-fluid data-[shown=true]:translate-y-0 data-[shown=true]:opacity-100 data-[shown=true]:blur-none ${className}`}
    >
      {children}
    </div>
  );
}
