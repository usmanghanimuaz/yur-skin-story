/** Merging of admin-edited interface labels over the built-in translations. Pure and browser-safe. */

export type OverrideRow = { locale: string; label_key: string; label_value: string };
export type OverrideMap = Record<string, Record<string, string>>;

export function toOverrideMap(rows: OverrideRow[]): OverrideMap {
  const map: OverrideMap = {};
  for (const row of rows) (map[row.locale] ??= {})[row.label_key] = row.label_value;
  return map;
}

/** An admin-edited label wins over the built-in one; the built-in text is the fallback. */
export function labelWithOverride(overrides: OverrideMap, locale: string, key: string, fallback: string): string {
  const value = overrides[locale]?.[key];
  return value && value.trim() ? value : fallback;
}

export function overrideCount(map: OverrideMap): number {
  return Object.values(map).reduce((sum, labels) => sum + Object.keys(labels).length, 0);
}
