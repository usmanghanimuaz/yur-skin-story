import { describe, expect, it } from "vitest";
import { pickSharedScans, nextSlide, SLIDE_MS } from "@/lib/community";

const people = [
  { id: "pA", user_id: "A", name: "Ayesha", is_me: true },
  { id: "pA2", user_id: "A", name: "Mom", is_me: false },
  { id: "pB", user_id: "B", name: "Bilal", is_me: true },
];
const row = (id: string, owner: string, profile: string, date: string, photo: string | null = "x.jpg") =>
  ({ id, owner_id: owner, profile_id: profile, photo_path: photo, overall_score: 70, metrics: {}, check_in_date: date });

describe("shared scans", () => {
  it("hides people who did not tick yes", () => {
    expect(pickSharedScans([row("1", "B", "pB", "2026-01-01")], people, new Set(["A"]))).toEqual([]);
  });
  it("never shows family profiles, only the owner's own scan", () => {
    const out = pickSharedScans([row("1", "A", "pA2", "2026-02-01"), row("2", "A", "pA", "2026-01-01")], people, new Set(["A"]));
    expect(out.map((r) => r.id)).toEqual(["2"]);
    expect(out[0]!.name).toBe("Ayesha");
  });
  it("shows only the latest scan with a photo per person", () => {
    const out = pickSharedScans([row("old", "A", "pA", "2026-01-01"), row("new", "A", "pA", "2026-03-01"), row("nophoto", "A", "pA", "2026-04-01", null)], people, new Set(["A"]));
    expect(out.map((r) => r.id)).toEqual(["new"]);
  });
  it("slides every 2 seconds and wraps around", () => {
    expect(SLIDE_MS).toBe(2000);
    expect(nextSlide(2, 3)).toBe(0);
  });
});
