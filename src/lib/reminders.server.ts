import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { reminderPlan, type DeliveredRow, type ReminderProfile } from "./reminders";

export type ReminderPassResult = { sent: number; weekly: number; routine: number; people: number };

/**
 * Gives every opted-in, unpaused person the reminder they are due for and records it,
 * so the same reminder is never given twice in one period. Safe to run more than once.
 */
export async function runReminderPass(admin: SupabaseClient<Database>, now: Date = new Date()): Promise<ReminderPassResult> {
  const [{ data: profiles }, { data: checkIns }, { data: controls }, { data: delivered }, { data: users }] = await Promise.all([
    admin.from("profiles").select("user_id, weekly_reminder, routine_reminders"),
    admin.from("check_ins").select("owner_id, check_in_date"),
    admin.from("account_controls").select("user_id, blocked"),
    admin.from("reminder_deliveries").select("owner_id, kind, bucket"),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  const emails: Record<string, string> = {};
  for (const user of users?.users ?? []) emails[user.id] = user.email ?? "unknown";

  const latest: Record<string, string | null> = {};
  for (const row of checkIns ?? []) {
    const seen = latest[row.owner_id];
    if (!seen || row.check_in_date > seen) latest[row.owner_id] = row.check_in_date;
  }

  const plan = reminderPlan({
    profiles: (profiles ?? []) as ReminderProfile[],
    emails,
    latestCheckIn: latest,
    blocked: (controls ?? []).filter((c) => c.blocked).map((c) => c.user_id),
    delivered: (delivered ?? []) as DeliveredRow[],
    now,
  });
  if (!plan.length) return { sent: 0, weekly: 0, routine: 0, people: 0 };

  const { error } = await admin.from("reminder_deliveries").upsert(
    plan.map((p) => ({ owner_id: p.user_id, kind: p.kind, bucket: p.bucket, sent_at: now.toISOString() })),
    { onConflict: "owner_id,kind,bucket", ignoreDuplicates: true },
  );
  if (error) throw new Error("Reminders could not be recorded.");

  const { data: written } = await admin.from("reminder_deliveries").select("owner_id, kind").eq("sent_at", now.toISOString());
  const rows = written ?? [];
  return {
    sent: rows.length,
    weekly: rows.filter((r) => r.kind === "weekly").length,
    routine: rows.filter((r) => r.kind === "routine").length,
    people: new Set(rows.map((r) => r.owner_id)).size,
  };
}
