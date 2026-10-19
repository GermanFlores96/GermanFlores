export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";
export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

export type FlightCopy = {
  label: string;
  eyebrow: string;
  title: string;
  body: string;
  tags: string[];
};

export type CaseCopy = {
  id: "mony" | "security" | "ai";
  kicker: string;
  title: string;
  challenge: string;
  work: string;
  result: string;
  tags: string[];
};

export type Dictionary = {
  // ogLine: what follows the role on the share image (opengraph-image.tsx).
  meta: { title: string; description: string; ogLocale: string; ogLine: string };
  nav: {
    brandRole: string;
    links: { id: string; label: string }[];
    cta: string;
    openMenu: string;
    closeMenu: string;
    language: string;
    skip: string;
  };
  flight: {
    hint: string;
    skip: string;
    summaryLabel: string;
    loading: string;
    more: string;
    swipe: string;
    swipeLast: string;
    scrollHint: string;
    next: string;
    prev: string;
    goTo: string;
    motion: {
      noticeAnimated: string;
      noticeStill: string;
      noticeLowData: string;
      toStill: string;
      toAnimated: string;
      dismiss: string;
    };
    finalCta: { primary: string; secondary: string };
    scenes: FlightCopy[];
  };
  tagline: { lines: string };
  cases: {
    eyebrow: string;
    title: string;
    intro: string;
    labels: { challenge: string; work: string; result: string };
    items: CaseCopy[];
  };
  stack: {
    eyebrow: string;
    title: string;
    groups: { title: string; items: string[] }[];
  };
  career: {
    eyebrow: string;
    title: string;
    jobs: {
      role: string;
      company: string;
      period: string;
      place: string;
      points: string[];
    }[];
    educationTitle: string;
    education: { school: string; period: string; degree: string }[];
  };
  about: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
    facts: { label: string; value: string }[];
    photoAlt: string;
  };
  contact: {
    eyebrow: string;
    title: string;
    body: string;
    email: string;
    linkedin: string;
    availability: string;
  };
  footer: { rights: string; privacy: string; backToTop: string };
  notFound: { title: string; body: string; back: string };
};
