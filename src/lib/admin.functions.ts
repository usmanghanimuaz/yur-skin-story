import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { canStartSupportThread, supportDraftError } from "./support";
import { parseCatalogueCsv, rowHasListing } from "./import-csv";
import { contentCoverage } from "./content-overrides";
import { CONTENT_DEFAULTS } from "./content";
import { reminderOptIns, weeklyDue } from "./reminders";
import { countPerDay, percent, recentDays } from "./overview";
import type { Database } from "@/integrations/supabase/types";

const uuid = z.string().uuid();
const REPLY_MAX = 6000;
const CONTENT_MAX = 3000;

/** Every admin action re-checks the role server-side; the browser is never trusted for this. */
async function requireAdmin(supabase: SupabaseClient<Database>, userId: string): Promise<string | null> {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!data) throw new Error("This area is for app maintainers.");
  const { data: user } = await supabase.auth.getUser();
  return user.user?.email ?? null;
}

async function emailMap(admin: SupabaseClient<Database>): Promise<Record<string, string>> {
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const map: Record<string, string> = {};
  for (const user of data?.users ?? []) map[user.id] = user.email ?? "unknown";
  return map;
}

/** Writes one line into the maintainer activity trail. Never fails the action it follows. */
async function logAdminActivity(
  admin: SupabaseClient<Database>,
  entry: { actorId: string; actorEmail: string | null; action: string; target?: string | null; detail?: string | null },
) {
  await admin.from("admin_activity_log").insert({
    actor_id: entry.actorId,
    actor_email: entry.actorEmail,
    action: entry.action,
    target: entry.target ?? null,
    detail: entry.detail ?? null,
  });
}

/** A public, read-only client for wording anyone may see. Same shape as the label reader below. */
function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: { fetch: (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
}

/* ---------------------------------- support ---------------------------------- */

export const submitSupportMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ subject: z.string().min(1).max(300), body: z.string().min(1).max(8000) }).parse(input))
  .handler(async ({ data, context }) => {
    const problem = supportDraftError(data);
    if (problem) throw new Error(problem);
    const { data: open } = await context.supabase.from("support_messages").select("status").eq("owner_id", context.userId).in("status", ["open", "replied"]);
    if (!canStartSupportThread(open ?? [])) throw new Error("You already have 3 messages waiting for a reply. We answer within two working days.");
    const { error } = await context.supabase.from("support_messages").insert({ owner_id: context.userId, subject: data.subject.trim(), body: data.body.trim() });
    if (error) throw new Error("Your message could not be sent. Please try again.");
    await context.supabase.from("account_activity").insert({ owner_id: context.userId, event: "support_message", detail: data.subject.trim().slice(0, 120) });
    return { success: true };
  });

export const mySupportMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("support_messages").select("*").eq("owner_id", context.userId).order("created_at", { ascending: false }).limit(50);
    if (error) throw new Error("Your messages could not be loaded.");
    return data ?? [];
  });

export const adminSupportInbox = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await admin.from("support_messages").select("*").order("created_at", { ascending: false }).limit(100);
    if (error) throw new Error("The inbox could not be loaded.");
    const emails = await emailMap(admin);
    return (data ?? []).map((m) => ({ ...m, email: emails[m.owner_id] ?? "unknown" }));
  });

export const adminReplySupport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: uuid, reply: z.string().min(1).max(REPLY_MAX), close: z.boolean().default(false) }).parse(input))
  .handler(async ({ data, context }) => {
    const actorEmail = await requireAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("support_messages").update({
      admin_reply: data.reply.trim(),
      replied_at: new Date().toISOString(),
      status: data.close ? "closed" : "replied",
      updated_at: new Date().toISOString(),
    }).eq("id", data.id);
    if (error) throw new Error("The reply could not be saved.");
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    await logAdminActivity(admin, {
      actorId: context.userId,
      actorEmail,
      action: data.close ? "support_reply_closed" : "support_reply",
      target: data.id,
      detail: data.reply.trim().slice(0, 160),
    });
    return { success: true };
  });

/* ------------------------------- deletion queue ------------------------------- */

export const adminDeletionQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase.from("photo_deletion_requests").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) throw new Error("The deletion queue could not be loaded.");
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    const emails = await emailMap(admin);
    const rows = (data ?? []).map((r) => ({ ...r, email: emails[r.owner_id] ?? "unknown" }));
    const counts = {
      pending: rows.filter((r) => r.status === "pending" && r.attempts === 0).length,
      failing: rows.filter((r) => r.status === "pending" && r.attempts > 0).length,
      erased: rows.filter((r) => r.status === "erased").length,
      invalid: rows.filter((r) => r.status === "invalid").length,
    };
    return { rows, counts };
  });

export const adminRetryDeletions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const actorEmail = await requireAdmin(context.supabase, context.userId);
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    const { processDeletionQueue } = await import("./erasure.server");
    const result = await processDeletionQueue(admin);
    await admin.from("account_activity").insert({ owner_id: context.userId, event: "deletion_retry", detail: `${result.erased} of ${result.scanned} queued photos erased` });
    await logAdminActivity(admin, {
      actorId: context.userId,
      actorEmail,
      action: "deletion_queue_run",
      detail: `${result.erased} erased of ${result.scanned} queued`,
    });
    return result;
  });

/* ----------------------------- accounts and limits ----------------------------- */

export const adminAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    const { data: users, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) throw new Error("Accounts could not be loaded.");
    const [{ data: checkIns }, { data: controls }, { data: quota }] = await Promise.all([
      admin.from("check_ins").select("owner_id, check_in_date"),
      admin.from("account_controls").select("user_id, blocked, reason"),
      admin.from("analysis_quota").select("owner_id, window_key, count"),
    ]);
    const today = `day:${new Date().toISOString().slice(0, 10)}`;
    const scans = new Map<string, { total: number; last: string | null }>();
    for (const row of checkIns ?? []) {
      const seen = scans.get(row.owner_id) ?? { total: 0, last: null };
      seen.total += 1;
      if (!seen.last || row.check_in_date > seen.last) seen.last = row.check_in_date;
      scans.set(row.owner_id, seen);
    }
    const blocked = new Map((controls ?? []).map((c) => [c.user_id, c]));
    const used = new Map((quota ?? []).filter((q) => q.window_key === today).map((q) => [q.owner_id, q.count]));
    return (users?.users ?? [])
      .map((u) => ({
        id: u.id,
        email: u.email ?? "unknown",
        verified: Boolean(u.email_confirmed_at),
        created: u.created_at ?? null,
        scans: scans.get(u.id)?.total ?? 0,
        lastScan: scans.get(u.id)?.last ?? null,
        today: used.get(u.id) ?? 0,
        blocked: blocked.get(u.id)?.blocked ?? false,
        reason: blocked.get(u.id)?.reason ?? null,
      }))
      .sort((a, b) => (b.created ?? "").localeCompare(a.created ?? ""));
  });

export const adminSetBlocked = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ userId: uuid, blocked: z.boolean(), reason: z.string().max(300).default("") }).parse(input))
  .handler(async ({ data, context }) => {
    const actorEmail = await requireAdmin(context.supabase, context.userId);
    if (data.userId === context.userId) throw new Error("You cannot pause your own account.");
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    const { error } = await admin.from("account_controls").upsert(
      { user_id: data.userId, blocked: data.blocked, reason: data.reason.trim() || null, set_by: context.userId, set_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
    if (error) throw new Error("The account state could not be saved.");
    const emails = await emailMap(admin);
    await logAdminActivity(admin, {
      actorId: context.userId,
      actorEmail,
      action: data.blocked ? "account_paused" : "account_resumed",
      target: emails[data.userId] ?? data.userId,
      detail: data.reason.trim() || null,
    });
    return { success: true };
  });

/* ---------------------------------- scan log ---------------------------------- */

export const adminScanLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase.from("scan_logs").select("*").order("created_at", { ascending: false }).limit(100);
    if (error) throw new Error("The scan log could not be loaded.");
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    const emails = await emailMap(admin);
    return (data ?? []).map((l) => ({ ...l, email: emails[l.owner_id] ?? "unknown" }));
  });

/* -------------------------------- bulk import -------------------------------- */

export const adminBulkImport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ csv: z.string().min(1).max(200000) }).parse(input))
  .handler(async ({ data, context }) => {
    const actorEmail = await requireAdmin(context.supabase, context.userId);
    const parsed = parseCatalogueCsv(data.csv);
    if (!parsed.rows.length) throw new Error(parsed.errors[0] ?? "No rows were found. Each line needs at least a product name.");
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    const seen = new Map<string, string>();
    let products = 0;
    let listings = 0;
    const problems = [...parsed.errors];

    for (const row of parsed.rows) {
      const key = `${row.name.toLowerCase()}|${row.brand.toLowerCase()}`;
      let id = seen.get(key);
      if (!id) {
        const { data: existing } = await admin.from("catalogue_products").select("id").eq("name", row.name).eq("brand", row.brand).limit(1).maybeSingle();
        if (existing) {
          id = existing.id;
        } else {
          const { data: created, error } = await admin.from("catalogue_products").insert({
            name: row.name, brand: row.brand, category: row.category || "other", actives: row.actives,
          }).select("id").single();
          if (error || !created) { problems.push(`Could not add ${row.name}.`); continue; }
          id = created.id;
          products += 1;
        }
        seen.set(key, id);
      }
      if (rowHasListing(row)) {
        const { error } = await admin.from("product_availability").insert({
          product_id: id, country: row.country, retailer: row.retailer,
          price: row.price ? Number(row.price) : null, currency: row.currency || null, url: row.url || null,
        });
        if (error) problems.push(`The listing for ${row.name} could not be added.`); else listings += 1;
      }
    }
    await logAdminActivity(admin, {
      actorId: context.userId,
      actorEmail,
      action: "catalogue_import",
      detail: `${products} products, ${listings} listings, ${problems.length} skipped`,
    });
    return { products, listings, problems: problems.slice(0, 10), skipped: problems.length };
  });

/* ------------------------------ label overrides ------------------------------ */

export const localeOverrides = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await publicClient().from("locale_overrides").select("locale, label_key, label_value");
  return data ?? [];
});

export const adminSetLocaleOverride = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ locale: z.string().min(2).max(10), key: z.string().min(1).max(60), value: z.string().min(1).max(400) }).parse(input))
  .handler(async ({ data, context }) => {
    const actorEmail = await requireAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("locale_overrides").upsert(
      { locale: data.locale, label_key: data.key, label_value: data.value, updated_at: new Date().toISOString() },
      { onConflict: "locale,label_key" },
    );
    if (error) throw new Error("The label could not be saved.");
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    await logAdminActivity(admin, { actorId: context.userId, actorEmail, action: "label_saved", target: `${data.locale}/${data.key}`, detail: data.value.slice(0, 160) });
    return { success: true };
  });

export const adminDeleteLocaleOverride = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ locale: z.string().min(2).max(10), key: z.string().min(1).max(60) }).parse(input))
  .handler(async ({ data, context }) => {
    const actorEmail = await requireAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("locale_overrides").delete().eq("locale", data.locale).eq("label_key", data.key);
    if (error) throw new Error("The label could not be removed.");
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    await logAdminActivity(admin, { actorId: context.userId, actorEmail, action: "label_removed", target: `${data.locale}/${data.key}` });
    return { success: true };
  });

/* ------------------------------ page wording ------------------------------ */

export const contentOverrides = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await publicClient().from("content_overrides").select("locale, page_key, text_key, text_value");
  return data ?? [];
});

export const adminSetContentOverride = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    locale: z.string().min(2).max(10),
    page: z.string().min(1).max(60),
    key: z.string().min(1).max(60),
    value: z.string().min(1).max(CONTENT_MAX),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const actorEmail = await requireAdmin(context.supabase, context.userId);
    if (!CONTENT_DEFAULTS[data.page]) throw new Error("That page cannot be translated from here.");
    if (!CONTENT_DEFAULTS[data.page][data.key]) throw new Error("That sentence is not on the page.");
    const { error } = await context.supabase.from("content_overrides").upsert(
      { locale: data.locale, page_key: data.page, text_key: data.key, text_value: data.value, updated_at: new Date().toISOString() },
      { onConflict: "locale,page_key,text_key" },
    );
    if (error) throw new Error("The wording could not be saved.");
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    await logAdminActivity(admin, { actorId: context.userId, actorEmail, action: "page_text_saved", target: `${data.locale}/${data.page}/${data.key}`, detail: data.value.slice(0, 160) });
    return { success: true };
  });

export const adminDeleteContentOverride = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ locale: z.string().min(2).max(10), page: z.string().min(1).max(60), key: z.string().min(1).max(60) }).parse(input))
  .handler(async ({ data, context }) => {
    const actorEmail = await requireAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("content_overrides").delete().eq("locale", data.locale).eq("page_key", data.page).eq("text_key", data.key);
    if (error) throw new Error("The wording could not be removed.");
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    await logAdminActivity(admin, { actorId: context.userId, actorEmail, action: "page_text_removed", target: `${data.locale}/${data.page}/${data.key}` });
    return { success: true };
  });

/* ----------------------------- maintainer activity ----------------------------- */

export const adminActivityLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase.from("admin_activity_log").select("*").order("created_at", { ascending: false }).limit(100);
    if (error) throw new Error("The activity log could not be loaded.");
    return data ?? [];
  });

/** Lets the catalogue maintainer panel record what it changed without trusting the browser. */
export const logAdminAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ action: z.string().min(2).max(60), target: z.string().max(160).default(""), detail: z.string().max(300).default("") }).parse(input))
  .handler(async ({ data, context }) => {
    const actorEmail = await requireAdmin(context.supabase, context.userId);
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    await logAdminActivity(admin, { actorId: context.userId, actorEmail, action: data.action, target: data.target || null, detail: data.detail || null });
    return { success: true };
  });

/* --------------------------------- overview --------------------------------- */

export const adminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    const now = new Date();
    const today = `day:${now.toISOString().slice(0, 10)}`;
    const [{ data: users }, { data: checkIns }, { data: deletion }, { data: support }, { data: products }, { data: evidence }, { data: profiles }, { data: controls }, { data: quota }] = await Promise.all([
      admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      admin.from("check_ins").select("created_at, engine, photo_path"),
      admin.from("photo_deletion_requests").select("status, attempts"),
      admin.from("support_messages").select("status"),
      admin.from("catalogue_products").select("status"),
      admin.from("evidence_entries").select("status"),
      admin.from("profiles").select("weekly_reminder, routine_reminders"),
      admin.from("account_controls").select("blocked"),
      admin.from("analysis_quota").select("window_key, count"),
    ]);
    const days = recentDays(now, 7);
    const accounts = users?.users ?? [];
    const weekAgo = now.getTime() - 7 * 86400000;
    const engines = new Map<string, number>();
    for (const row of checkIns ?? []) engines.set(row.engine ?? "unknown", (engines.get(row.engine ?? "unknown") ?? 0) + 1);
    const openSupport = (support ?? []).filter((s) => s.status === "open").length;
    return {
      accounts: {
        total: accounts.length,
        verified: accounts.filter((u) => u.email_confirmed_at).length,
        joined7: accounts.filter((u) => Date.parse(u.created_at ?? "") >= weekAgo).length,
        verifiedPercent: percent(accounts.filter((u) => u.email_confirmed_at).length, accounts.length),
      },
      scans: {
        total: (checkIns ?? []).length,
        today: (quota ?? []).filter((q) => q.window_key === today).reduce((sum, q) => sum + (q.count ?? 0), 0),
        perDay: countPerDay(checkIns ?? [], days),
        days,
        byEngine: [...engines.entries()].map(([engine, count]) => ({ engine, count })),
      },
      photos: {
        stored: (checkIns ?? []).filter((c) => c.photo_path).length,
        waiting: (deletion ?? []).filter((d) => d.status === "pending").length,
        failing: (deletion ?? []).filter((d) => d.status === "pending" && (d.attempts ?? 0) > 0).length,
      },
      support: { open: openSupport, total: (support ?? []).length },
      limits: { paused: (controls ?? []).filter((c) => c.blocked).length },
      catalogue: {
        products: (products ?? []).length,
        pendingReview: (products ?? []).filter((p) => p.status === "seed_pending_review").length,
        retired: (products ?? []).filter((p) => p.status === "retired").length,
        evidence: (evidence ?? []).length,
        evidencePending: (evidence ?? []).filter((e) => !e.reviewed_at && e.status !== "reviewed").length,
      },
      reminders: reminderOptIns((profiles ?? []) as { user_id: string; weekly_reminder: boolean; routine_reminders: boolean }[]),
    };
  });

/* --------------------------------- reminders --------------------------------- */

export const adminReminderCentre = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    const now = new Date();
    const [{ data: profiles }, { data: checkIns }, { data: controls }, { data: delivered }, emails] = await Promise.all([
      admin.from("profiles").select("user_id, weekly_reminder, routine_reminders"),
      admin.from("check_ins").select("owner_id, check_in_date"),
      admin.from("account_controls").select("user_id, blocked"),
      admin.from("reminder_deliveries").select("owner_id, kind, bucket, sent_at").order("sent_at", { ascending: false }).limit(100),
      emailMap(admin),
    ]);
    const latest: Record<string, string | null> = {};
    for (const row of checkIns ?? []) {
      const seen = latest[row.owner_id];
      if (!seen || row.check_in_date > seen) latest[row.owner_id] = row.check_in_date;
    }
    const blocked = new Set((controls ?? []).filter((c) => c.blocked).map((c) => c.user_id));
    const opted = (profiles ?? []).filter((p) => p.weekly_reminder || p.routine_reminders);
    const due = opted
      .filter((p) => !blocked.has(p.user_id) && p.weekly_reminder && weeklyDue(latest[p.user_id], now.getTime()))
      .map((p) => ({ user_id: p.user_id, email: emails[p.user_id] ?? "unknown", last: latest[p.user_id] ?? null }));
    return {
      optIns: reminderOptIns((profiles ?? []) as { user_id: string; weekly_reminder: boolean; routine_reminders: boolean }[]),
      optedIn: opted.length,
      blocked: blocked.size,
      due,
      recent: (delivered ?? []).map((d) => ({ ...d, email: emails[d.owner_id] ?? "unknown" })),
    };
  });

export const adminSendReminders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const actorEmail = await requireAdmin(context.supabase, context.userId);
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    const { runReminderPass } = await import("./reminders.server");
    const result = await runReminderPass(admin);
    await logAdminActivity(admin, {
      actorId: context.userId,
      actorEmail,
      action: "reminders_sent",
      detail: `${result.sent} recorded (${result.weekly} weekly, ${result.routine} routine)`,
    });
    return result;
  });

/* ------------------------------- translation map ------------------------------ */

export const adminTranslationStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);
    const rows = await contentOverrides();
    const map: Record<string, Record<string, Record<string, string>>> = {};
    for (const row of rows) ((map[row.locale] ??= {})[row.page_key] ??= {})[row.text_key] = row.text_value;
    return Object.fromEntries(
      Object.keys(CONTENT_DEFAULTS).map((page) => [page, Object.fromEntries(
        Object.keys(CONTENT_DEFAULTS[page]).map((key) => [key, Object.keys(map).map((locale) => {
          const value = map[locale]?.[page]?.[key] ?? "";
          return { locale, done: Boolean(value.trim()) };
        })]),
      )]),
    );
  });
