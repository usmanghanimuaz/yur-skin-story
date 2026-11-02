import { METRICS, type Metrics, type MetricKey } from "./skin";

export type CheckInLite = { check_in_date: string; overall_score: number; metrics: Metrics };
export type ProductLite = { id: string; started_date: string; stopped_date: string | null };

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

/** Compares the person's own check-ins before a product start with those during its use. No invented data. */
export function productImpact(product: ProductLite, checkIns: CheckInLite[]) {
  const start = new Date(product.started_date).getTime();
  const stop = product.stopped_date ? new Date(product.stopped_date).getTime() + 86400000 : Infinity;
  const before = checkIns.filter((c) => new Date(c.check_in_date).getTime() < start);
  const during = checkIns.filter((c) => {
    const t = new Date(c.check_in_date).getTime();
    return t >= start && t < stop;
  });
  if (!before.length || !during.length) return { enoughData: false as const, beforeCount: before.length, duringCount: during.length };
  const overall = (avg(during.map((c) => c.overall_score)) ?? 0) - (avg(before.map((c) => c.overall_score)) ?? 0);
  const byMetric = METRICS.map((m) => {
    const b = avg(before.map((c) => c.metrics[m.key]).filter((v): v is number => typeof v === "number"));
    const d = avg(during.map((c) => c.metrics[m.key]).filter((v): v is number => typeof v === "number"));
    return { key: m.key as MetricKey, change: b === null || d === null ? null : Math.round((d - b) * 10) / 10 };
  }).filter((x) => x.change !== null);
  return { enoughData: true as const, beforeCount: before.length, duringCount: during.length, overallChange: Math.round(overall * 10) / 10, byMetric };
}

export function buildRoutineIcs(morning: string, night: string, now = new Date()): string {
  const d = now.toISOString().slice(0, 10).replace(/-/g, "");
  const ev = (id: string, time: string, title: string) => {
    const [h = "00", m = "00"] = time.split(":");
    return ["BEGIN:VEVENT", `UID:${id}-${d}@skintwin`, `DTSTAMP:${d}T000000Z`, `DTSTART:${d}T${h.padStart(2, "0")}${m.padStart(2, "0")}00`, "RRULE:FREQ=DAILY", `SUMMARY:${title}`, "END:VEVENT"].join("\r\n");
  };
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Skin Twin AI//Routine//EN", ev("am", morning, "Skin Twin AI morning routine"), ev("pm", night, "Skin Twin AI night routine"), "END:VCALENDAR"].join("\r\n");
}