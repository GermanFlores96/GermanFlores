import type { Dictionary, Locale } from "./types";
import { es } from "./es";
import { en } from "./en";

const dictionaries: Record<Locale, Dictionary> = { es, en };

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];
