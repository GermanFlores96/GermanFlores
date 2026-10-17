"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Translate } from "@phosphor-icons/react";
import type { Locale } from "@/content/types";

type Props = {
  lang: Locale;
  name: string;
  role: string;
  links: { id: string; label: string }[];
  cta: string;
  email: string;
  openMenu: string;
  closeMenu: string;
  languageLabel: string;
  skip: string;
};

const SECTION_IDS = ["casos", "stack", "trayectoria", "sobre-mi", "contacto"];

export function SiteNav({
  lang,
  name,
  role,
  links,
  cta,
  email,
  openMenu,
  closeMenu,
  languageLabel,
  skip,
}: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const otherLang: Locale = lang === "es" ? "en" : "es";

  // Current section, for aria-current and the highlighted link.
  useEffect(() => {
    const targets = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Menu open: lock page scroll and close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const linkClass =
    "rounded-lg px-3 py-2 text-sm font-semibold text-muted transition-all duration-700 ease-fluid hover:text-ink aria-[current=true]:text-ink";

  return (
    <>
      <a
        href="#contenido"
        className="bg-violet fixed top-2 left-2 z-[500] -translate-y-24 rounded-lg px-3 py-2 text-sm font-semibold text-white transition-transform duration-700 ease-fluid focus:translate-y-0"
      >
        {skip}
      </a>

      <header className="pointer-events-none fixed inset-x-0 top-0 z-[400] px-4">
        <nav
          aria-label={name}
          className="border-line bg-bg/70 pointer-events-auto mx-auto mt-6 flex w-max max-w-full items-center gap-2 rounded-full border py-2 pr-2 pl-2 backdrop-blur-xl"
        >
          <Link
            href={`/${lang}`}
            className="flex items-center gap-2 rounded-full pr-2"
            onClick={() => setOpen(false)}
          >
            <Image
              src="/img/avatar.webp"
              alt=""
              width={32}
              height={32}
              className="size-8 rounded-full object-cover"
            />
            <span className="flex flex-col leading-none">
              <span className="text-sm font-semibold">{name}</span>
              <span className="text-muted hidden text-xs sm:block">{role}</span>
            </span>
          </Link>

          <ul className="hidden items-center md:flex">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  aria-current={active === link.id ? "true" : undefined}
                  className={linkClass}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <Link
            href={`/${otherLang}`}
            hrefLang={otherLang}
            aria-label={languageLabel}
            className="text-muted hover:text-ink flex min-h-10 items-center gap-1 rounded-full px-2 text-sm font-semibold transition-all duration-700 ease-fluid"
          >
            <Translate size={16} aria-hidden />
            {otherLang.toUpperCase()}
          </Link>

          <a
            href={`mailto:${email}`}
            className="bg-violet hover:bg-violet-soft hidden min-h-10 items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-white transition-all duration-700 ease-fluid active:scale-[0.98] md:flex"
          >
            {cta}
            <ArrowUpRight size={16} weight="bold" aria-hidden />
          </a>

          <button
            type="button"
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? closeMenu : openMenu}
            onClick={() => setOpen((value) => !value)}
            className="border-line relative size-10 rounded-full border md:hidden"
          >
            <span
              className={`bg-ink absolute top-1/2 left-1/2 block h-0.5 w-4 -translate-x-1/2 rounded-full transition-all duration-700 ease-fluid ${
                open ? "translate-y-0 rotate-45" : "-translate-y-1"
              }`}
            />
            <span
              className={`bg-ink absolute top-1/2 left-1/2 block h-0.5 w-4 -translate-x-1/2 rounded-full transition-all duration-700 ease-fluid ${
                open ? "translate-y-0 -rotate-45" : "translate-y-1"
              }`}
            />
          </button>
        </nav>
      </header>

      <div
        id="menu-movil"
        aria-hidden={!open}
        inert={!open}
        className={`bg-bg/80 fixed inset-0 z-[390] flex flex-col justify-center gap-4 px-6 backdrop-blur-3xl transition-all duration-700 ease-fluid md:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        {[...links, { id: "contacto", label: cta }].map((link, i) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            onClick={() => setOpen(false)}
            style={{ transitionDelay: open ? `${100 + i * 50}ms` : "0ms" }}
            className={`text-4xl font-semibold tracking-tight transition-all duration-700 ease-fluid ${
              open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            } ${active === link.id ? "text-ink" : "text-muted"}`}
          >
            {link.label}
          </a>
        ))}
      </div>
    </>
  );
}
