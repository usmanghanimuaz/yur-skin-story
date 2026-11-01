export const METRICS = [
  { key: "clarity", label: "Clarity", description: "How clear the skin looks, with fewer visible blemishes." },
  { key: "oil_control", label: "Oil control", description: "How balanced shine looks across the face." },
  { key: "pores", label: "Pores", description: "How refined visible pores appear." },
  { key: "texture", label: "Texture", description: "How smooth the skin surface appears." },
  { key: "fine_lines", label: "Fine lines", description: "How few visible fine lines are detected." },
  { key: "firmness", label: "Firmness", description: "How firm and lifted the skin appears." },
  { key: "pigment", label: "Even tone", description: "How even skin tone and spots look." },
  { key: "redness", label: "Redness", description: "How calm the skin looks, with less visible redness." },
  { key: "dark_circles", label: "Dark circles", description: "How bright the under-eye area appears." },
  { key: "hydration", label: "Hydration", description: "How hydrated the skin appears." },
  { key: "radiance", label: "Radiance", description: "How luminous the complexion appears." },
] as const;

export type MetricKey = (typeof METRICS)[number]["key"];
export type Metrics = Partial<Record<MetricKey, number>>;

/** YouCam SD skin-analysis actions mapped to Your Skin Story metrics. Higher score = better. */
export const YOUCAM_ACTIONS: Record<string, MetricKey> = {
  acne: "clarity",
  oiliness: "oil_control",
  pore: "pores",
  texture: "texture",
  wrinkle: "fine_lines",
  firmness: "firmness",
  age_spot: "pigment",
  redness: "redness",
  dark_circle_v2: "dark_circles",
  moisture: "hydration",
  radiance: "radiance",
};

export function clampScore(n: unknown): number | null {
  const v = typeof n === "number" ? n : typeof n === "string" ? Number(n) : NaN;
  if (!Number.isFinite(v)) return null;
  return Math.max(0, Math.min(100, Math.round(v)));
}

/** Extract real provider scores; returns null if the result contains no recognisable scores. Never invents values. */
export function normalizeYoucamScores(output: unknown): { metrics: Metrics; overall: number } | null {
  const metrics: Metrics = {};
  const visit = (node: unknown, keyHint?: string) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach((n) => visit(n));
      return;
    }
    const obj = node as Record<string, unknown>;
    const type = typeof obj["type"] === "string" ? obj["type"] : keyHint;
    if (type && YOUCAM_ACTIONS[type] && ("ui_score" in obj || "score" in obj)) {
      const s = clampScore(obj["ui_score"] ?? obj["score"]);
      if (s !== null) metrics[YOUCAM_ACTIONS[type]] = s;
    }
    for (const [k, v] of Object.entries(obj)) visit(v, k);
  };
  visit(output);
  const values = Object.values(metrics).filter((v): v is number => typeof v === "number");
  if (values.length < 3) return null;
  return { metrics, overall: overallScore(metrics) };
}

export function overallScore(metrics: Metrics): number {
  const values = Object.values(metrics).filter((v): v is number => typeof v === "number");
  if (!values.length) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export function delta(now?: number | null, before?: number | null): number | null {
  if (typeof now !== "number" || typeof before !== "number") return null;
  return now - before;
}

export function scoreLabel(score: number): string {
  if (score >= 80) return "Looking great";
  if (score >= 65) return "Balanced";
  if (score >= 50) return "Needs some care";
  return "Extra care focus";
}

export function weakestMetrics(metrics: Metrics, count = 3): MetricKey[] {
  return (Object.entries(metrics) as [MetricKey, number][])
    .filter(([, v]) => typeof v === "number")
    .sort((a, b) => a[1] - b[1])
    .slice(0, count)
    .map(([k]) => k);
}

export function metricLabel(key: string): string {
  return METRICS.find((m) => m.key === key)?.label ?? key;
}

export const ANALYSIS_LIMITS = { perTenMinutes: 3, perDay: 10, appPerDay: 500 } as const;

export function quotaWindows(now: Date) {
  const day = now.toISOString().slice(0, 10);
  const tenMin = `${day}T${String(now.getUTCHours()).padStart(2, "0")}:${Math.floor(now.getUTCMinutes() / 10)}`;
  return { tenMin: `10m:${tenMin}`, day: `day:${day}`, appDay: `app:${day}` };
}