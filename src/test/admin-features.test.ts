import { describe, expect, it } from "vitest";
import { alreadyDelivered, deliveryBucket, reminderOptIns, reminderPlan, routineSlot, weeklyDue } from "@/lib/reminders";
import { contentCoverage, contentWithOverride, toContentMap } from "@/lib/content-overrides";
import { contentRowCount } from "@/lib/content-overrides";
import { countPerDay, dayKey, percent, recentDays } from "@/lib/overview";

const NOW = new Date("2026-11-02T09:00:00Z");

describe("weekly reminders", () => {
  it("is due when there is no check-in yet", () => {
    expect(weeklyDue(null, NOW.getTime())).toBe(true);
  });
  it("is not due six days after a check-in", () => {
    expect(weeklyDue(new Date(NOW.getTime() - 6 * 86400000).toISOString(), NOW.getTime())).toBe(false);
  });
  it("is due eight days after a check-in", () => {
    expect(weeklyDue(new Date(NOW.getTime() - 8 * 86400000).toISOString(), NOW.getTime())).toBe(true);
  });
  it("gives one bucket per week and one per routine slot", () => {
    expect(deliveryBucket("weekly", NOW)).toBe("weekly:2026-11-02");
    expect(deliveryBucket("routine", new Date("2026-11-02T06:00:00Z"))).toBe("routine:2026-11-02:morning");
    expect(routineSlot(new Date("2026-11-02T20:00:00Z"))).toBe("night");
    expect(deliveryBucket("routine", new Date("2026-11-02T20:00:00Z"))).toBe("routine:2026-11-02:night");
  });
});

describe("reminder plan", () => {
  const profiles = [
    { user_id: "a", weekly_reminder: true, routine_reminders: false },
    { user_id: "b", weekly_reminder: true, routine_reminders: true },
    { user_id: "c", weekly_reminder: true, routine_reminders: false },
    { user_id: "d", weekly_reminder: false, routine_reminders: false },
  ];
  const emails = { a: "a@example.com", b: "b@example.com", c: "c@example.com", d: "d@example.com" };
  const latestCheckIn = { a: null, b: new Date(NOW.getTime() - 8 * 86400000).toISOString(), c: NOW.toISOString(), d: null };

  it("picks only people who opted in, are due and were not already reminded", () => {
    const plan = reminderPlan({ profiles, emails, latestCheckIn, blocked: [], delivered: [], now: NOW });
    expect(plan.map((p) => `${p.user_id}:${p.kind}`).sort()).toEqual(["a:weekly", "b:routine", "b:weekly"]);
  });

  it("skips a paused account even when it is due", () => {
    const plan = reminderPlan({ profiles, emails, latestCheckIn, blocked: ["a"], delivered: [], now: NOW });
    expect(plan.some((p) => p.user_id === "a")).toBe(false);
  });

  it("never repeats a reminder already recorded for this period", () => {
    const delivered = [{ owner_id: "b", kind: "weekly", bucket: "weekly:2026-11-02" }];
    const plan = reminderPlan({ profiles, emails, latestCheckIn, blocked: [], delivered, now: NOW });
    expect(plan.map((p) => `${p.user_id}:${p.kind}`)).toEqual(["a:weekly", "b:routine"]);
  });

  it("counts who has each reminder switched on", () => {
    expect(reminderOptIns(profiles)).toEqual({ weekly: 3, routine: 1 });
  });

  it("reports an already-recorded reminder", () => {
    expect(alreadyDelivered([{ owner_id: "a", kind: "weekly", bucket: "weekly:2026-11-02" }], "a", "weekly", "weekly:2026-11-02")).toBe(true);
    expect(alreadyDelivered([], "a", "weekly", "weekly:2026-11-02")).toBe(false);
  });
});

describe("page wording overrides", () => {
  const rows = [
    { locale: "ur", page_key: "landing", text_key: "hero_lead", text_value: "Apni skin ki kahani." },
    { locale: "ur", page_key: "landing", text_key: "cta_button", text_value: "Shuru karein" },
    { locale: "fr", page_key: "landing", text_key: "hero_lead", text_value: "Votre histoire." },
  ];
  const map = toContentMap(rows);

  it("shows edited wording for the chosen language only", () => {
    expect(contentWithOverride(map, "ur", "landing", "hero_lead", "Default")).toBe("Apni skin ki kahani.");
    expect(contentWithOverride(map, "en", "landing", "hero_lead", "Default")).toBe("Default");
  });

  it("falls back to the built-in text when the edit is blank", () => {
    const blank = toContentMap([{ locale: "ur", page_key: "landing", text_key: "hero_lead", text_value: "   " }]);
    expect(contentWithOverride(blank, "ur", "landing", "hero_lead", "Default")).toBe("Default");
  });

  it("counts how much of one page is written in one language", () => {
    const defaults = { hero_lead: "x", cta_button: "y", hero_title: "z" };
    expect(contentCoverage(map, "ur", "landing", defaults)).toEqual({ done: 2, total: 3 });
    expect(contentCoverage(map, "de", "landing", defaults)).toEqual({ done: 0, total: 3 });
  });

  it("counts every written sentence across languages", () => {
    expect(contentRowCount(map)).toBe(3);
  });
});

describe("overview numbers", () => {
  it("lists the last seven days oldest first", () => {
    const days = recentDays(NOW, 7);
    expect(days).toHaveLength(7);
    expect(days[6]).toBe("2026-11-02");
    expect(days[0]).toBe("2026-10-27");
  });

  it("counts rows on each listed day and ignores other days", () => {
    const days = ["2026-11-01", "2026-11-02"];
    const rows = [
      { created_at: "2026-11-01T10:00:00Z" },
      { created_at: "2026-11-01T23:00:00Z" },
      { created_at: "2026-11-02T01:00:00Z" },
      { created_at: "2026-10-30T01:00:00Z" },
      { created_at: null },
    ];
    expect(countPerDay(rows, days)).toEqual([2, 1]);
  });

  it("reads a day from a timestamp safely", () => {
    expect(dayKey("2026-11-02T09:00:00Z")).toBe("2026-11-02");
    expect(dayKey(null)).toBe("");
    expect(dayKey("not a date")).toBe("");
  });

  it("turns parts into whole percentages without dividing by zero", () => {
    expect(percent(1, 4)).toBe(25);
    expect(percent(0, 0)).toBe(0);
  });
});
