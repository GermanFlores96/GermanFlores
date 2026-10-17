import type { Dictionary } from "./types";

export const en: Dictionary = {
  meta: {
    title: "German Flores · Senior Mobile Engineer · Mobile, web and AI",
    description:
      "Mobile engineer with 9+ years building secure iOS and Android apps in fintech, banking and payments. Today I also build with React Native, Next.js and AI agents.",
    ogLocale: "en_US",
    ogAlt: "German Flores and his clay diorama world: secure apps, at AI speed.",
  },
  nav: {
    brandRole: "Senior Mobile Engineer",
    links: [
      { id: "casos", label: "Work" },
      { id: "stack", label: "Stack" },
      { id: "trayectoria", label: "Experience" },
      { id: "sobre-mi", label: "About" },
    ],
    cta: "Email me",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    language: "Switch language to Spanish",
    skip: "Skip to content",
  },
  flight: {
    hint: "Scroll to fly",
    skip: "Skip the flight",
    summaryLabel: "A tour of my work",
    motion: {
      noticeAnimated:
        "Your device asks for less motion. The flight only moves when you scroll, but you can view it as still images.",
      noticeStill: "You are viewing the flight as still images.",
      toStill: "Use still images",
      toAnimated: "Turn on the animated flight",
      dismiss: "Got it",
    },
    finalCta: { primary: "Email me", secondary: "LinkedIn" },
    scenes: [
      {
        label: "Studio",
        eyebrow: "Senior Mobile Engineer · Mobile, web and AI",
        title: "Secure apps, at AI speed.",
        body: "9+ years building mobile apps where data and money matter. Today I also build with React Native, Next.js and AI agents.",
        tags: ["iOS and Android", "React Native", "Next.js", "Applied AI"],
      },
      {
        label: "Mony",
        eyebrow: "In production, with real money",
        title: "Flows that move real money.",
        body: "I helped design and build transfers, reloads and card management for Mony, the Mercantil Panamá app.",
        tags: ["Transfers", "Reloads", "Cards"],
      },
      {
        label: "Vault",
        eyebrow: "Security and payments",
        title: "Banking level security, payments in one tap.",
        body: "I led the integration of security and tokenization SDKs and connected the app to Apple Pay and Google Pay.",
        tags: ["Entrust", "VUSecurity", "Apple Pay and Google Pay"],
      },
      {
        label: "AI workshop",
        eyebrow: "AI applied to engineering",
        title: "AI agents that ship with the team.",
        body: "I build skills and tools so AI agents can design, code, test and deploy alongside me, with a live preview of every screen.",
        tags: ["AI agents", "1:1 live preview", "QA and DevOps"],
      },
      {
        label: "Team",
        eyebrow: "Technical leadership",
        title: "Agile teams that deliver.",
        body: "I lead development teams with Scrum and Kanban, from planning to production.",
        tags: ["Scrum", "Kanban", "6+ years in agile"],
      },
      {
        label: "Contact",
        eyebrow: "Let us talk",
        title: "Shall we build what is next?",
        body: "Tell me about your idea or your project.",
        tags: [],
      },
    ],
  },
  tagline: {
    lines:
      "I build apps people trust with their data and their money. Now I build them with AI, without letting go of quality.",
  },
  cases: {
    eyebrow: "Selected work",
    title: "Three things I built that are still in use.",
    intro: "Every case follows the same order: the challenge, what I did and what changed.",
    labels: { challenge: "The challenge", work: "What I did", result: "What changed" },
    items: [
      {
        id: "mony",
        kicker: "Mobile banking",
        title: "Mony, by Mercantil Panamá",
        challenge:
          "Moving money from a phone demands flows that are clear, fast and leave no room for error.",
        work: "I helped design and build the transfers, reloads and card management modules in Volt MX.",
        result: "More people handling their banking from the app: it drove digital adoption.",
        tags: ["Volt MX", "Transfers", "Reloads", "Cards"],
      },
      {
        id: "security",
        kicker: "Security and payments",
        title: "Tokenization and digital wallets",
        challenge:
          "A financial app has to verify the person and protect every operation, and still let them pay in one tap.",
        work: "I led the integration of Entrust (token validation) and VUSecurity on Android and iOS, and integrated the HST SDK in Quantum Visualizer for Apple Pay and Google Pay.",
        result: "Security and digital wallet payments working inside the same app.",
        tags: ["Entrust", "VUSecurity", "HST", "Apple Pay", "Google Pay"],
      },
      {
        id: "ai",
        kicker: "Applied AI",
        title: "AI agents for Volt MX Iris",
        challenge:
          "Speed up mobile development without losing quality or control over what ships.",
        work: "I build skills and tools that cover design, development, QA and deployment. A 1:1 render of Iris forms on the web lets the agents see their own work live.",
        result: "A development cycle assisted by AI from end to end.",
        tags: ["AI agents", "1:1 live preview", "QA", "DevOps"],
      },
    ],
  },
  stack: {
    eyebrow: "Stack and skills",
    title: "What I build with.",
    groups: [
      {
        title: "Mobile",
        items: [
          "React Native",
          "Expo",
          "Volt MX (Kony Quantum)",
          "Volt MX Iris",
          "iOS",
          "Android",
          "Xcode",
          "Android Studio",
        ],
      },
      {
        title: "Web",
        items: ["Next.js", "React", "TypeScript", "JavaScript", "Tailwind CSS", "Supabase", "Prisma", "PWA"],
      },
      {
        title: "Applied AI",
        items: [
          "Agents and skills",
          "Spec driven development",
          "Google Gemini",
          "Anthropic Claude",
          "Cursor",
          "Antigravity",
        ],
      },
      {
        title: "Security and payments",
        items: ["Entrust", "VUSecurity", "HST SDK", "Apple Pay", "Google Pay", "Tokenization"],
      },
      {
        title: "Ways of working",
        items: ["Scrum", "Kanban", "Technical leadership", "Git", "Native Spanish", "Professional English"],
      },
    ],
  },
  career: {
    eyebrow: "Experience",
    title: "Building apps since 2017.",
    jobs: [
      {
        role: "Own projects",
        company: "Independent development",
        period: "2026",
        place: "Remote",
        points: [
          "Online store with an admin panel, inventory and order auditing: Next.js, Prisma and Supabase.",
          "Android delivery tracking app with React Native and Expo: works offline, syncs when the network returns and protects access with biometrics.",
          "PWA that analyses food with Gemini vision and answers in under 4 seconds, with history stored on the phone itself.",
          "Makeup store built with AI agents guided by specs, with automated and accessibility tests.",
        ],
      },
      {
        role: "Development specialist",
        company: "Soluciones Laser C.A.",
        period: "August 2017 to today",
        place: "Caracas, Venezuela",
        points: [
          "Transactional development and design: transfers, reloads and card management for the Mony app by Mercantil Panamá.",
          "Security SDK integration: Entrust (token validation) and VUSecurity on Android and iOS, on top of Volt MX.",
          "Digital wallet integration: HST SDK in Quantum Visualizer for Google Pay and Apple Pay.",
          "Technical collaboration: supporting and guiding the programming team with Git, Xcode and Android Studio, under Scrum and Kanban.",
          "AI assisted development: modern IDEs and language models to gain speed and quality in mobile code.",
        ],
      },
    ],
    educationTitle: "Education",
    education: [
      {
        school: "Dr. Federico Rivero Palacio",
        period: "2013 to 2018",
        degree: "Computer Engineering",
      },
    ],
  },
  about: {
    eyebrow: "About",
    title: "From mobile banking to the web and AI.",
    paragraphs: [
      "I am a computer engineer. I have spent more than 9 years building mobile apps for banking, where a mistake costs money and security is not negotiable.",
      "I now bring that discipline to other ground: online stores with Next.js, apps with React Native and AI tools that help me build faster without losing judgment. I have guided teams with Scrum and Kanban, and I like solving the technical problems others prefer to avoid.",
    ],
    facts: [
      { label: "Based in", value: "Caracas, Venezuela" },
      { label: "Languages", value: "Native Spanish · Professional English" },
      { label: "Focus", value: "Mobile, web and applied AI" },
    ],
    photoAlt: "Portrait of German Flores, smiling, with a short beard and a black shirt.",
  },
  contact: {
    eyebrow: "Contact",
    title: "Shall we build what is next?",
    body: "Tell me about your idea or your project. I reply by email or on LinkedIn.",
    email: "Email me",
    linkedin: "View LinkedIn",
    availability: "Open to a conversation",
  },
  footer: {
    rights: "German Flores. All rights reserved.",
    privacy: "This site uses no cookies and no analytics.",
    backToTop: "Back to top",
  },
  notFound: {
    title: "This page does not exist",
    body: "The link is broken or the page moved.",
    back: "Back to home",
  },
};
