"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDictionary } from "@/content/dictionaries";
import { defaultLocale, hasLocale } from "@/content/types";

export default function NotFound() {
  // not-found receives no params, so the locale is read from the requested path.
  const first = usePathname().split("/")[1] ?? "";
  const lang = hasLocale(first) ? first : defaultLocale;
  const { notFound } = getDictionary(lang);

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-start justify-center gap-6 px-6">
      <p className="font-mono text-sm text-cyan">404</p>
      <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{notFound.title}</h1>
      <p className="text-lg text-muted">{notFound.body}</p>
      <Link
        href={`/${lang}`}
        className="inline-flex min-h-12 items-center rounded-lg bg-violet px-3 py-2 text-base font-semibold text-white transition-all duration-700 ease-fluid hover:bg-violet-soft active:scale-[0.98]"
      >
        {notFound.back}
      </Link>
    </main>
  );
}
