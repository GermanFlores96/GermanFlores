import Link from "next/link";
import { CaretUp } from "@phosphor-icons/react/ssr";
import { site } from "@/content/shared";
import type { Dictionary, Locale } from "@/content/types";

export function Footer({ lang, copy }: { lang: Locale; copy: Dictionary["footer"] }) {
  const other: Locale = lang === "es" ? "en" : "es";
  return (
    <footer className="border-line border-t px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="text-muted text-sm">
          <p>
            © {site.year} {copy.rights}
          </p>
          <p className="mt-1">{copy.privacy}</p>
        </div>
        <div className="flex items-center gap-6 text-sm font-semibold">
          <Link
            href={`/${other}`}
            hrefLang={other}
            className="text-muted hover:text-ink transition-all duration-700 ease-fluid"
          >
            {other === "es" ? "Español" : "English"}
          </Link>
          <a
            href="#top"
            className="text-muted hover:text-ink flex items-center gap-1 transition-all duration-700 ease-fluid"
          >
            {copy.backToTop}
            <CaretUp size={16} weight="bold" aria-hidden />
          </a>
        </div>
      </div>
    </footer>
  );
}
