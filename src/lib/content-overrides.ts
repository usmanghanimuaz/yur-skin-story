/** Merging of maintainer-written page wording over the built-in text. Pure and browser-safe. */

export type ContentRow = { locale: string; page_key: string; text_key: string; text_value: string };
/** locale -> page -> key -> wording */
export type ContentMap = Record<string, Record<string, Record<string, string>>>;

export function toContentMap(rows: ContentRow[]): ContentMap {
  const map: ContentMap = {};
  for (const row of rows) ((map[row.locale] ??= {})[row.page_key] ??= {})[row.text_key] = row.text_value;
  return map;
}

/** Edited wording wins over the built-in text; the built-in text is always the fallback. */
export function contentWithOverride(map: ContentMap, locale: string, page: string, key: string, fallback: string): string {
  const value = map[locale]?.[page]?.[key];
  return value && value.trim() ? value : fallback;
}

/** How much of a page is translated into a language, for the admin progress line. */
export function contentCoverage(map: ContentMap, locale: string, defaults: Record<string, string>): { done: number; total: number } {
  const keys = Object.keys(defaults);
  const edited = map[locale]?.[Object.keys(map[locale] ?? {})[0]] ?? {};
  const done = keys.filter((k) => (map[locale]?.[Object.keys(map[locale] ?? {})[0]]?.[k] ?? edited[k] ?? "").trim()).length;
  return { done, total: keys.length };
}

/** Total number of edited page sentences across every language. */
export function contentRowCount(map: ContentMap): number {
  return Object.values(map).reduce((pages, page) => pages + Object.values(page).reduce((keys, k) => keys + Object.keys(k).length, 0), 0);
}
