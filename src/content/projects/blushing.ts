import type { Project } from "./types";

export const blushing: Project = {
  slug: "blushing",
  order: 1,
  featured: true,
  status: "live",
  kind: "client",
  year: 2026,
  updated: "2026-10-29",
  url: "https://blushingve.com",
  code: { visibility: "private" },
  stack: [
    "Next.js 16",
    "React 19",
    "TypeScript",
    "Supabase",
    "PostgreSQL",
    "Tailwind CSS",
    "Zod",
    "Vitest",
    "Playwright",
    "Netlify",
    "Spec Kit",
  ],
  media: {
    version: "v1",
    shots: [
      {
        name: "inicio",
        alt: {
          es: "Inicio de Blushing con la foto del gloss del momento y los accesos al catálogo",
          en: "Blushing home page with the featured gloss photo and links to the catalog",
        },
      },
      {
        name: "producto",
        alt: {
          es: "Ficha del Lip Gloss con su precio en euros, la referencia en bolívares a tasa BCV y el tono elegido",
          en: "Lip Gloss product page with its price in euros, the reference in bolívares at the BCV rate and the chosen shade",
        },
      },
      {
        name: "catalogo",
        alt: {
          es: "Catálogo completo con filtros por tipo de producto, marcas, descuentos y precios en euros",
          en: "Full catalog with product type filters, brands, discounts and prices in euros",
        },
      },
      // Admin panel: captured from a local copy with sample data (fictitious names, phones and IDs), never from
      // production. sw-work/scripts/capturar_proyecto.mjs explains how to sign in for these.
      {
        name: "panel-pedidos",
        alt: {
          es: "Panel de administración con datos de ejemplo: lista de pedidos con filtros por estado y búsqueda",
          en: "Admin panel with sample data: order list with status filters and search",
        },
      },
      {
        name: "panel-pedido",
        alt: {
          es: "Panel de administración con datos de ejemplo: pedido por verificar con el pago móvil, su referencia y el monto en bolívares",
          en: "Admin panel with sample data: an order awaiting payment check, with its mobile payment reference and the amount in bolívares",
        },
      },
      {
        name: "panel-producto",
        alt: {
          es: "Panel de administración con datos de ejemplo: tonos de un labial con su color, SKU y stock en mano, apartado y disponible",
          en: "Admin panel with sample data: a lipstick's shades with their color, SKU and stock on hand, reserved and available",
        },
      },
    ],
  },
  copy: {
    es: {
      name: "Blushing",
      kicker: "Tienda online de maquillaje",
      tagline:
        "Tienda de maquillaje y skincare para Venezuela, con compra sin cuentas y un panel para llevar el negocio desde el teléfono.",
      summary:
        "Catálogo por tonos, precios en euros con su referencia en bolívares, checkout sin cuentas y un panel de pedidos para la dueña.",
      description:
        "Blushing, tienda online de maquillaje en Venezuela creada por Germán Flores con Next.js, Supabase y agentes de IA guiados por specs.",
      problem:
        "Una tienda de maquillaje en Venezuela fija sus precios en euros, cobra en bolívares, dólares o USDT y atiende casi todo por WhatsApp. La dueña necesitaba una tienda propia que pudiera llevar ella misma desde el teléfono, sin publicar sus cuentas de pago y sin depender de un programador para cargar productos.",
      role: "Arquitectura, desarrollo, pruebas y despliegue",
      work: [
        "Catálogo por categorías con filtros, búsqueda y fichas con selector de tonos, cada tono con su propio stock.",
        "Precios en euros con la referencia en bolívares a la tasa oficial del BCV, que la tienda actualiza sola cada día.",
        "Carrito y checkout sin cuentas: la clienta elige la entrega y el método de pago, y WhatsApp se abre con su número de pedido para recibir los datos de pago.",
        "Panel para la dueña y su equipo: productos con fotos subidas desde el iPhone, pedidos con estados e historial, verificación de pagos, pedidos registrados a mano y exportación a CSV.",
        "Acceso al panel solo por invitación, con recuperación de contraseña por correo.",
      ],
      decisions: [
        {
          title: "Specs antes que código",
          body: "Cada funcionalidad empezó como una especificación aprobada con la dueña y la construí con agentes de IA guiados por esa spec (Spec Kit). La spec es el contrato que evita que el código se aleje de lo que el negocio necesita.",
        },
        {
          title: "La seguridad vive en la base de datos",
          body: "Los datos están en Supabase con políticas de seguridad por fila, cubiertas por pruebas propias. La clave de servicio solo existe en el servidor: el navegador nunca habla directo con la base.",
        },
        {
          title: "Un despliegue que no sale a medias",
          body: "Si falta una variable de configuración, el despliegue falla con un mensaje que dice cuál y la versión anterior sigue en línea. En producción la tienda tampoco arranca con datos de ejemplo.",
        },
        {
          title: "Pruebas en cada flujo",
          body: "Pruebas unitarias con Vitest, pruebas de base de datos contra Supabase local y pruebas de extremo a extremo con Playwright en Chromium y WebKit, con revisión automática de accesibilidad.",
        },
      ],
      result:
        "La tienda está en producción en blushingve.com. La dueña carga sus productos, recibe pedidos y confirma pagos desde el teléfono, y las clientas compran sin crear una cuenta.",
    },
    en: {
      name: "Blushing",
      kicker: "Online makeup store",
      tagline:
        "A makeup and skincare store for Venezuela, with guest checkout and an admin panel to run the business from a phone.",
      summary:
        "Catalog by shade, prices in euros with their reference in bolívares, guest checkout and an order panel for the owner.",
      description:
        "Blushing, an online makeup store in Venezuela built by Germán Flores with Next.js, Supabase and AI agents guided by specs.",
      problem:
        "A makeup store in Venezuela sets its prices in euros, gets paid in bolívares, dollars or USDT and handles almost everything over WhatsApp. The owner needed a store of her own that she could run from her phone, without publishing her payment accounts and without needing a developer to add products.",
      role: "Architecture, development, testing and deployment",
      work: [
        "Catalog by category with filters, search and product pages with a shade picker, each shade with its own stock.",
        "Prices in euros with the reference in bolívares at the official BCV rate, which the store updates on its own every day.",
        "Cart and guest checkout: the customer picks delivery and payment method, and WhatsApp opens with her order number to receive the payment details.",
        "Admin panel for the owner and her team: products with photos uploaded from an iPhone, orders with statuses and history, payment checks, orders entered by hand and CSV export.",
        "Panel access by invitation only, with password recovery by email.",
      ],
      decisions: [
        {
          title: "Specs before code",
          body: "Every feature started as a specification approved with the owner, and I built it with AI agents guided by that spec (Spec Kit). The spec is the contract that keeps the code from drifting away from what the business needs.",
        },
        {
          title: "Security lives in the database",
          body: "The data sits in Supabase with row level security policies, covered by their own tests. The service key only exists on the server: the browser never talks to the database directly.",
        },
        {
          title: "A deployment that never ships half done",
          body: "If a configuration variable is missing, the deployment fails with a message naming it and the previous version stays online. In production the store also refuses to start with sample data.",
        },
        {
          title: "Tests on every flow",
          body: "Unit tests with Vitest, database tests against a local Supabase and end to end tests with Playwright in Chromium and WebKit, with automated accessibility checks.",
        },
      ],
      result:
        "The store is live at blushingve.com. The owner adds products, takes orders and confirms payments from her phone, and customers buy without creating an account.",
    },
  },
};
