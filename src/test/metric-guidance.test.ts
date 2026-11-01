import { describe, it, expect } from "vitest";
import { METRICS } from "@/lib/skin";

describe("metric guidance", () => {
  it("every metric has a plain-language description and one small next step", () => {
    expect(METRICS.length).toBe(11);
    for (const m of METRICS) {
      expect(m.description.length).toBeGreaterThan(10);
      expect(m.tip.length).toBeGreaterThan(10);
    }
  });

  it("guidance stays cosmetic and avoids medical claims", () => {
    for (const m of METRICS) {
      const text = `${m.label} ${m.description} ${m.tip}`.toLowerCase();
      for (const word of ["diagnos", "treat", "cure", "disease", "medical", "prescri"]) {
        expect(text).not.toContain(word);
      }
    }
  });
});
