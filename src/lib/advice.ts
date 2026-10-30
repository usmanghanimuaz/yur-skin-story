import { type Metrics, type MetricKey, weakestMetrics } from "./skin";

export type SafetyInputs = {
  pregnancy: boolean;
  allergies?: string | null;
  skin_type?: string | null;
  age_band?: string | null;
  currentActives?: string[];
};

export type Recommendation = {
  key: string;
  concern: MetricKey;
  title: string;
  detail: string;
  ingredient: string;
  caution?: string;
};

type Entry = Recommendation & { avoidInPregnancy?: boolean; allergens?: string[]; conflictsWith?: string[]; minAge?: string[] };

const CATALOGUE: Entry[] = [
  { key: "niacinamide-clarity", concern: "clarity", ingredient: "niacinamide", title: "Try a gentle niacinamide serum", detail: "Often used to support a clearer-looking complexion. Introduce slowly, once daily." },
  { key: "salicylic-clarity", concern: "clarity", ingredient: "salicylic acid", title: "A low-strength salicylic cleanser", detail: "Can help skin look less congested. Use 2–3 times a week to start.", avoidInPregnancy: true, allergens: ["salicylate", "aspirin"], conflictsWith: ["retinol", "glycolic acid"] },
  { key: "clay-oil", concern: "oil_control", ingredient: "kaolin clay", title: "Weekly clay mask", detail: "Many people use a clay mask once a week to reduce the look of shine." },
  { key: "niacinamide-oil", concern: "oil_control", ingredient: "niacinamide", title: "Lightweight gel moisturiser", detail: "Keeps skin comfortable without heaviness. Look for oil-free textures." },
  { key: "bha-pores", concern: "pores", ingredient: "salicylic acid", title: "Occasional BHA exfoliation", detail: "Can make pores look more refined. Never over-exfoliate.", avoidInPregnancy: true, allergens: ["salicylate", "aspirin"], conflictsWith: ["retinol"] },
  { key: "lactic-texture", concern: "texture", ingredient: "lactic acid", title: "Gentle lactic acid, once a week", detail: "A mild exfoliant often chosen for smoother-feeling skin. Patch test first.", conflictsWith: ["retinol", "glycolic acid"] },
  { key: "retinol-lines", concern: "fine_lines", ingredient: "retinol", title: "Low-strength retinol at night", detail: "Commonly used for the look of fine lines. Start twice weekly and always wear SPF.", avoidInPregnancy: true, allergens: ["retinol", "retinoid"], conflictsWith: ["salicylic acid", "glycolic acid", "lactic acid"], minAge: ["18-24", "25-34", "35-44", "45-54", "55+"] },
  { key: "peptide-lines", concern: "fine_lines", ingredient: "peptides", title: "Peptide moisturiser", detail: "A gentle option many people choose to keep skin looking smooth." },
  { key: "peptide-firm", concern: "firmness", ingredient: "peptides", title: "Daily peptide cream", detail: "Supports a plumper, firmer appearance alongside sun protection." },
  { key: "spf-pigment", concern: "pigment", ingredient: "broad-spectrum SPF", title: "Daily SPF 30 or higher", detail: "The single most useful habit for a more even-looking tone. Reapply outdoors." },
  { key: "vitc-pigment", concern: "pigment", ingredient: "vitamin C", title: "Morning vitamin C serum", detail: "Often used for a brighter, more even look. Store away from light.", allergens: ["ascorbic", "vitamin c"] },
  { key: "centella-redness", concern: "redness", ingredient: "centella asiatica", title: "Soothing centella products", detail: "Choose fragrance-free, calming formulas. See a professional if redness persists.", allergens: ["centella"] },
  { key: "caffeine-circles", concern: "dark_circles", ingredient: "caffeine", title: "Caffeine eye gel and rest", detail: "Cool caffeine gels and steady sleep can help the under-eye look brighter." },
  { key: "ha-hydration", concern: "hydration", ingredient: "hyaluronic acid", title: "Hyaluronic acid on damp skin", detail: "Apply to damp skin and seal with moisturiser for a hydrated look." },
  { key: "ceramide-hydration", concern: "hydration", ingredient: "ceramides", title: "Ceramide moisturiser", detail: "Helps skin feel comfortable and look supple." },
  { key: "vitc-radiance", concern: "radiance", ingredient: "vitamin C", title: "Vitamin C plus SPF in the morning", detail: "A common pairing for a more radiant-looking complexion.", allergens: ["ascorbic", "vitamin c"] },
];

export function buildAdvice(metrics: Metrics, safety: SafetyInputs, max = 4): Recommendation[] {
  const weak = weakestMetrics(metrics, 3);
  const allergyText = (safety.allergies ?? "").toLowerCase();
  const actives = (safety.currentActives ?? []).map((a) => a.toLowerCase());
  const picked: Recommendation[] = [];
  for (const concern of weak) {
    for (const e of CATALOGUE.filter((c) => c.concern === concern)) {
      if (safety.pregnancy && e.avoidInPregnancy) continue;
      if (e.allergens?.some((a) => allergyText.includes(a)) || allergyText.includes(e.ingredient.toLowerCase())) continue;
      if (e.minAge && safety.age_band && !e.minAge.includes(safety.age_band)) continue;
      const conflict = e.conflictsWith?.find((c) => actives.some((a) => a.includes(c)));
      const { avoidInPregnancy: _a, allergens: _b, conflictsWith: _c, minAge: _d, ...rec } = e;
      picked.push(conflict ? { ...rec, caution: `You already use ${conflict}; avoid applying both in the same routine.` } : rec);
      if (picked.length >= max) return picked;
    }
  }
  return picked;
}

export function safetyHash(s: SafetyInputs): string {
  return JSON.stringify([s.pregnancy, s.allergies ?? "", s.skin_type ?? "", s.age_band ?? "", [...(s.currentActives ?? [])].sort()]);
}