/** Rules for who gets a reminder and when. Kept browser-safe so both the admin page and the scheduled job use one source of truth. */

export const REMINDER_KINDS = ["weekly", "routine"] as const;
export type ReminderKind = (typeof REMINDER_KINDS)[number];
export type RoutineSlot = "morning" | "night";

export const WEEK_MS = 7 * 86400000;

export type ReminderProfile = {
  user_id: string;
  weekly_reminder: boolean;
  routine_reminders: boolean;
};

export type DeliveredRow = { owner_id: string; kind: string; bucket: string };

export type ReminderCandidate = { user_id: string; kind: ReminderKind; bucket: string; email: string };

/** The period a reminder belongs to, so the same reminder is never given twice in one period. */
export function deliveryBucket(kind: ReminderKind, when: Date, slot?: RoutineSlot): string {
  const day = when.toISOString().slice(0, 10);
  return kind === "weekly" ? `weekly:${day}` : `routine:${day}:${slot ?? routineSlot(when)}`;
}

/** Morning reminders run before mid-afternoon, night reminders after it. */
export function routineSlot(when: Date): RoutineSlot {
  return when.getUTCHours() < 15 ? "morning" : "night";
}

/** A person is due for a weekly reminder when their latest check-in is a week old, or they have none. */
export function weeklyDue(latestCheckIn: string | null | undefined, now: number = Date.now()): boolean {
  if (!latestCheckIn) return true;
  const seen = Date.parse(latestCheckIn);
  if (Number.isNaN(seen)) return true;
  return now - seen >= WEEK_MS;
}

/** True when this period's reminder has already been given. */
export function alreadyDelivered(rows: DeliveredRow[], ownerId: string, kind: ReminderKind, bucket: string): boolean {
  return rows.some((r) => r.owner_id === ownerId && r.kind === kind && r.bucket === bucket);
}

export type ReminderPlanInput = {
  profiles: ReminderProfile[];
  emails: Record<string, string>;
  latestCheckIn: Record<string, string | null>;
  blocked: string[];
  delivered: DeliveredRow[];
  now?: Date;
};

/** Everyone who should be reminded right now: opted in, not paused, due, and not already reminded for this period. */
export function reminderPlan(input: ReminderPlanInput): ReminderCandidate[] {
  const now = input.now ?? new Date();
  const blocked = new Set(input.blocked);
  const out: ReminderCandidate[] = [];
  for (const profile of input.profiles) {
    if (blocked.has(profile.user_id)) continue;
    const email = input.emails[profile.user_id] ?? "unknown";
    if (profile.weekly_reminder) {
      const bucket = deliveryBucket("weekly", now);
      if (weeklyDue(input.latestCheckIn[profile.user_id], now.getTime()) && !alreadyDelivered(input.delivered, profile.user_id, "weekly", bucket)) {
        out.push({ user_id: profile.user_id, kind: "weekly", bucket, email });
      }
    }
    if (profile.routine_reminders) {
      const bucket = deliveryBucket("routine", now);
      if (!alreadyDelivered(input.delivered, profile.user_id, "routine", bucket)) {
        out.push({ user_id: profile.user_id, kind: "routine", bucket, email });
      }
    }
  }
  return out;
}

/** How many people have each reminder switched on, for the admin summary line. */
export function reminderOptIns(profiles: ReminderProfile[]): { weekly: number; routine: number } {
  return {
    weekly: profiles.filter((p) => p.weekly_reminder).length,
    routine: profiles.filter((p) => p.routine_reminders).length,
  };
}
