/** Small number helpers behind the admin overview. Pure and browser-safe so they can be tested. */

export type Dated = { created_at: string | null };

/** The calendar day a timestamp falls on, as YYYY-MM-DD. */
export function dayKey(iso: string | null | undefined): string {
  if (!iso) return "";
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? "" : new Date(ms).toISOString().slice(0, 10);
}

/** The last `count` calendar days, oldest first, ending today. */
export function recentDays(now: Date, count: number): string[] {
  const days: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now.getTime() - i * 86400000);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

/** How many rows fall on each of the given days, in the same order. */
export function countPerDay(rows: Dated[], days: string[]): number[] {
  const totals = new Map(days.map((d) => [d, 0]));
  for (const row of rows) {
    const key = dayKey(row.created_at);
    if (totals.has(key)) totals.set(key, (totals.get(key) ?? 0) + 1);
  }
  return days.map((d) => totals.get(d) ?? 0);
}

/** A whole-number percentage, safe when there is nothing to divide by. */
export function percent(part: number, whole: number): number {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}
