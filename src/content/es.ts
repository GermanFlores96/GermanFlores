import type { Dictionary } from "./types";

export const es: Dictionary = {
  meta: {
    title: "Germán Flores · Senior Software Engineer · Móvil, web e IA",
    description:
      "Germán Flores, ingeniero de software en Caracas con más de 9 años creando apps seguras para banca y pagos (iOS y Android), web con Next.js y agentes de IA.",
    ogLocale: "es_VE",
    ogLine: "Móvil, web e IA",
  },
  nav: {
    brandRole: "Senior Software Engineer",
    links: [
      { id: "casos", label: "Casos" },
      { id: "stack", label: "Stack" },
      { id: "trayectoria", label: "Trayectoria" },
      { id: "sobre-mi", label: "Sobre mí" },
    ],
    cta: "Escríbeme",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    language: "Cambiar idioma a inglés",
    skip: "Saltar al contenido",
  },
  flight: {
    hint: "Desliza para recorrer",
    skip: "Saltar el recorrido",
    summaryLabel: "Recorrido por mi trabajo",
    loading: "Cargando el recorrido",
    more: "Sigue bajando: casos, stack y trayectoria",
    swipe: "Desliza hacia arriba",
    swipeLast: "Desliza para ver mi perfil",
    scrollHint: "Desplázate para recorrer",
    next: "Escena siguiente",
    prev: "Escena anterior",
    goTo: "Ir a la escena",
    motion: {
      noticeAnimated:
        "Tu dispositivo pide menos movimiento. El recorrido solo avanza cuando haces scroll, pero puedes verlo con imágenes fijas.",
      noticeStill: "Estás viendo el recorrido con imágenes fijas.",
      noticeLowData:
        "Tienes activado el ahorro de datos, así que el recorrido se muestra con imágenes fijas para no descargar video.",
      toStill: "Usar imágenes fijas",
      toAnimated: "Activar el recorrido animado",
      dismiss: "Entendido",
    },
    finalCta: { primary: "Ver mi perfil", secondary: "Escríbeme" },
    scenes: [
      {
        label: "Estudio",
        eyebrow: "Germán Flores · Senior Software Engineer",
        title: "Software seguro, a la velocidad de la IA.",
        body: "Más de 9 años construyendo software donde importan los datos y el dinero: apps para iOS y Android, web con Next.js y agentes de IA.",
        tags: ["iOS y Android", "React Native", "Next.js", "IA aplicada"],
      },
      {
        label: "Mony",
        eyebrow: "En producción, con dinero real",
        title: "Flujos que mueven dinero real.",
        body: "Codiseñé y programé transferencias, recargas y gestión de tarjetas para Mony, la app de Mercantil Panamá.",
        tags: ["Transferencias", "Recargas", "Tarjetas"],
      },
      {
        label: "Bóveda",
        eyebrow: "Seguridad y pagos",
        title: "Seguridad de nivel bancario, pagos con un toque.",
        body: "Lideré la integración de SDKs de seguridad y tokenización, y conecté la app con Apple Pay y Google Pay.",
        tags: ["Entrust", "VUSecurity", "Apple Pay y Google Pay"],
      },
      {
        label: "Taller de IA",
        eyebrow: "IA aplicada al desarrollo",
        title: "Agentes de IA que trabajan con el equipo.",
        body: "Creo skills y herramientas para que agentes de IA diseñen, programen, prueben y desplieguen conmigo, con vista previa en vivo de cada pantalla.",
        tags: ["Agentes de IA", "Vista previa 1:1", "QA y DevOps"],
      },
      {
        label: "Equipo",
        eyebrow: "Liderazgo técnico",
        title: "Equipos ágiles que entregan.",
        body: "Guío equipos de desarrollo con Scrum y Kanban, de la planificación a producción.",
        tags: ["Scrum", "Kanban", "Más de 6 años en ágil"],
      },
      {
        label: "Contacto",
        eyebrow: "Hablemos",
        title: "¿Construimos lo siguiente?",
        body: "Abajo tienes mis casos, mi stack y mi trayectoria.",
        tags: [],
      },
    ],
  },
  tagline: {
    lines:
      "Construyo software en el que la gente confía sus datos y su dinero. Ahora lo construyo con IA, sin soltar el control de la calidad.",
  },
  cases: {
    eyebrow: "Casos destacados",
    title: "Tres cosas que construí y siguen en uso.",
    intro: "Cada caso sigue el mismo orden: el reto, lo que hice y lo que cambió.",
    labels: { challenge: "El reto", work: "Lo que hice", result: "Lo que cambió" },
    items: [
      {
        id: "mony",
        kicker: "Banca móvil",
        title: "Mony, de Mercantil Panamá",
        challenge:
          "Mover dinero desde el teléfono exige flujos claros, rápidos y sin margen de error.",
        work: "Codiseñé y programé con el equipo los módulos de transferencias, recargas y gestión de tarjetas en Volt MX.",
        result: "Más personas resolviendo su banca desde la app: impulsó la adopción digital.",
        tags: ["Volt MX", "Transferencias", "Recargas", "Tarjetas"],
      },
      {
        id: "security",
        kicker: "Seguridad y pagos",
        title: "Tokenización y billeteras digitales",
        challenge:
          "Una app financiera debe verificar a la persona y proteger cada operación, y aun así permitir pagar con un toque.",
        work: "Lideré la integración de Entrust (validación de token) y VUSecurity en Android e iOS, e integré el SDK de HST en Quantum Visualizer para Apple Pay y Google Pay.",
        result: "Seguridad y pagos con billeteras digitales funcionando dentro de la misma app.",
        tags: ["Entrust", "VUSecurity", "HST", "Apple Pay", "Google Pay"],
      },
      {
        id: "ai",
        kicker: "IA aplicada",
        title: "Agentes de IA para Volt MX Iris",
        challenge:
          "Acelerar el desarrollo móvil sin perder calidad ni control sobre lo que se entrega.",
        work: "Creo skills y herramientas que cubren diseño, desarrollo, QA y despliegue. Un render 1:1 de los formularios de Iris en la web deja que los agentes vean su trabajo en vivo.",
        result: "Un ciclo de desarrollo asistido por IA de punta a punta.",
        tags: ["Agentes de IA", "Vista previa 1:1", "QA", "DevOps"],
      },
    ],
  },
  stack: {
    eyebrow: "Stack y habilidades",
    title: "Con lo que construyo.",
    groups: [
      {
        title: "Móvil",
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
        title: "IA aplicada",
        items: [
          "Agentes y skills",
          "Desarrollo guiado por specs",
          "Google Gemini",
          "Anthropic Claude",
          "Cursor",
          "Antigravity",
        ],
      },
      {
        title: "Seguridad y pagos",
        items: ["Entrust", "VUSecurity", "SDK de HST", "Apple Pay", "Google Pay", "Tokenización"],
      },
      {
        title: "Forma de trabajo",
        items: ["Scrum", "Kanban", "Liderazgo técnico", "Git", "Español nativo", "Inglés profesional"],
      },
    ],
  },
  career: {
    eyebrow: "Trayectoria",
    title: "Desde 2017 construyendo software.",
    jobs: [
      {
        role: "Proyectos propios",
        company: "Desarrollo independiente",
        period: "2026",
        place: "Remoto",
        points: [
          "Tienda en línea con panel de administración, inventario y auditoría de pedidos: Next.js, Prisma y Supabase.",
          "App Android de control de repartos con React Native y Expo: funciona sin conexión, sincroniza al volver la red y protege el acceso con biometría.",
          "PWA que analiza la comida con la visión de Gemini y responde en menos de 4 segundos, con historial guardado en el propio teléfono.",
          "Tienda de maquillaje construida con agentes de IA guiados por specs, con pruebas automáticas y de accesibilidad.",
        ],
      },
      {
        role: "Especialista en desarrollo",
        company: "Soluciones Laser C.A.",
        period: "Agosto 2017 a hoy",
        place: "Caracas, Venezuela",
        points: [
          "Desarrollo y diseño transaccional: transferencias, recargas y gestión de tarjetas para la app Mony de Mercantil Panamá.",
          "Integración de SDKs de seguridad: Entrust (validación de token) y VUSecurity en Android e iOS, sobre Volt MX.",
          "Integración de billeteras digitales: SDK de HST en Quantum Visualizer para Google Pay y Apple Pay.",
          "Colaboración técnica: apoyo y guía al equipo de programación con Git, Xcode y Android Studio, bajo Scrum y Kanban.",
          "Desarrollo asistido por IA: IDEs modernos y modelos de lenguaje para ganar velocidad y calidad en el código móvil.",
        ],
      },
    ],
    educationTitle: "Educación",
    education: [
      {
        school: "Instituto Universitario de Tecnología Dr. Federico Rivero Palacio",
        period: "2013 a 2018",
        degree: "Ingeniería en Informática",
      },
    ],
  },
  about: {
    eyebrow: "Sobre mí",
    title: "Software para lo que no puede fallar.",
    paragraphs: [
      "Soy Germán Flores, ingeniero en informática. Llevo más de 9 años construyendo software para banca, sobre todo apps para iOS y Android, donde un error cuesta dinero y la seguridad no se negocia.",
      "Esa disciplina la llevo ahora a otros terrenos: tiendas en línea con Next.js, apps con React Native y herramientas de IA que me ayudan a construir más rápido sin perder el criterio. He guiado equipos con Scrum y Kanban, y me gusta resolver los problemas técnicos que otros prefieren evitar.",
    ],
    facts: [
      { label: "Base", value: "Caracas, Venezuela" },
      { label: "Idiomas", value: "Español nativo · Inglés profesional" },
      { label: "Enfoque", value: "Móvil, web e IA aplicada" },
    ],
    photoAlt: "Retrato de Germán Flores, sonriendo, con barba corta y camisa negra.",
  },
  contact: {
    eyebrow: "Contacto",
    title: "¿Construimos lo siguiente?",
    body: "Cuéntame tu idea o tu proyecto. Respondo por correo o por LinkedIn.",
    email: "Escríbeme",
    linkedin: "Ver LinkedIn",
    availability: "Abierto a conversar",
  },
  footer: {
    rights: "Germán Flores. Todos los derechos reservados.",
    privacy: "Este sitio no usa cookies ni analítica.",
    backToTop: "Volver arriba",
  },
  notFound: {
    title: "Esta página no existe",
    body: "El enlace está roto o la página cambió de lugar.",
    back: "Volver al inicio",
  },
};
