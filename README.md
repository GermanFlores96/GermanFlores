# German Flores · portafolio

Next.js 16 (App Router, TypeScript, Tailwind 4). Hero con vuelo scroll-world (video controlado por scroll) y debajo secciones de portafolio. Bilingüe por ruta: `/es` y `/en`.

```bash
npm run dev      # desarrollo
npm run build    # producción
npm start        # servir la build (puerto 3000)
```

> Next.js 16 cambia APIs respecto a versiones anteriores (`proxy.ts` en lugar de `middleware.ts`, `params` asíncronos). Antes de tocar código, lee la guía correspondiente en `node_modules/next/dist/docs/`.

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Todos los textos (ES/EN) | `src/content/es.ts`, `src/content/en.ts` (tipados en `types.ts`) |
| Contacto, rutas de video, acentos y ritmo del vuelo | `src/content/shared.ts` |
| Motor del vuelo (vendorizado del skill `scroll-world`) | `src/components/scroll-world/engine.ts` |
| Wrapper React del motor | `src/components/scroll-world/ScrollWorld.tsx` |
| Secciones de la página | `src/components/sections/` |
| Redirección de idioma | `src/proxy.ts` |
| Estilos, paleta y ajustes del motor para tema oscuro | `src/app/globals.css` |
| Videos (escritorio 720p ≈ 33 MB; móvil 9:16 ≈ 31 MB) y pósteres | `public/vid/v1/`, `public/img/v1/scenes/` |

## Notas

- El fondo `#0F1428` es el fondo plano de las escenas generadas: no cambiarlo sin regenerar los pósteres.
- **Medios versionados:** vídeos y pósteres se sirven con caché de un año (`next.config.ts`). Para cambiar
  cualquiera, crea una carpeta nueva (`v2`) y actualiza `MEDIA` en `src/content/shared.ts` y las dos rutas
  del póster inicial en `globals.css`. Nunca sobrescribas archivos dentro de `v1`.
- Los teléfonos usan la cadena vertical (`-m.mp4`, 720 de ancho, `-g 4`); el escritorio, 720p 16:9 (`-g 8`).
- Con ahorro de datos activado se muestran imágenes fijas y no se descarga vídeo hasta que la persona lo pide.
- **Recorrido y paradas guiadas:** si la persona deja de hacer scroll dentro del recorrido, la cámara termina sola el
  trayecto hasta la escena siguiente o anterior (umbral: 15 % del tramo, máximo 0,3 pantallas). El último punto es el
  inicio de las secciones. Rueda, toque, tecla o clic cancelan el trayecto. Opción `stations` del motor.
- **Descargas:** el motor descarga por prioridad (tramo actual, 3 por delante, 1 por detrás, 2 a la vez) y muestra
  "Cargando el recorrido · N %" si el clip actual tarda. No hay `scroll-behavior: smooth` global a propósito: los enlaces
  saltan al instante en lugar de recorrer (y descargar) todo el trayecto.
- **Versión:** `/version` devuelve el commit desplegado (`NEXT_PUBLIC_BUILD_ID`, de `VERCEL_GIT_COMMIT_SHA`). Una pestaña
  abierta antes de un despliegue se recarga sola al volver a ella (`VersionCheck.tsx`), una vez por versión.
- Variable opcional `NEXT_PUBLIC_SITE_URL` para el dominio final (canonical, sitemap, og). Por defecto `site.url` en `shared.ts` (hoy `https://germanflores.vercel.app`).
