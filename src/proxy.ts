import { NextResponse, type NextRequest } from "next/server";
import { getProject } from "@/content/projects";
import { site } from "@/content/shared";
import { defaultLocale, locales, type Locale } from "@/content/types";

// First supported language found in Accept-Language, honouring the order of the header.
function pickLocale(request: NextRequest): Locale {
  const header = request.headers.get("accept-language") ?? "";
  const tags = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of tags) {
    const match = locales.find((locale) => tag === locale || tag.startsWith(`${locale}-`));
    if (match) return match;
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Links shared before the custom domain keep working: same path on the domain, permanently.
  if (request.headers.get("host") === site.legacyHost) {
    return NextResponse.redirect(new URL(pathname + search, site.url), 308);
  }

  // An unknown project slug renders on demand and its first response went out as 200 before notFound() ran.
  // Sending it to the catch-all gives a real 404 from the first visit.
  const project = pathname.match(/^\/(es|en)\/(?:proyectos|projects)\/([^/]+)\/?$/);
  if (project && !getProject(project[2])) {
    return NextResponse.rewrite(new URL(`/${project[1]}/404`, request.url));
  }

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return;

  const url = request.nextUrl.clone();
  url.pathname = `/${pickLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, the version endpoint and any path with a file extension (images, videos, icons, sitemap, robots).
  matcher: ["/((?!_next|api|version|.*\\..*).*)"],
};
