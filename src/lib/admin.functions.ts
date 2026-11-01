import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { canStartSupportThread, supportDraftError } from "./support";
import { parseCatalogueCsv, rowHasListing } from "./import-csv";
import type { Database } from "@/integrations/supabase/types";

const uuid = z.string().uuid();
const REPLY_MAX = 6000;

/** Every admin action re-checks the role server-side; the browser is never trusted for this. */
async function requireAdmin(supabase: SupabaseClient<Database>, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!data) throw new Error("This area is for app maintainers.");
}

async function emailMap(admin: SupabaseClient<Database>): Promise<Record<string, string>> {
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const map: Record<string, string> = {};
  for (const user of data?.users ?? []) map[user.id] = user.email ?? "unknown";
  return map;
}

/* ---------------------------------- support ---------------------------------- */

export const submitSupportMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ subject: z.string().min(1).max(300), body: z.string().min(1).max(8000) }).parse(input))
  .handler(async ({ data, context }) => {
    const problem = supportDraftError(data);
    if (problem) throw new Error(problem);
    const { data: open } = await context.supabase.from("support_messages").select("id").eq("owner_id", context.userId).in("status", ["open", "replied"]);
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
    await requireAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("support_messages").update({
      admin_reply: data.reply.trim(),
      replied_at: new Date().toISOString(),
      status: data.close ? "closed" : "replied",
      updated_at: new Date().toISOString(),
    }).eq("id", data.id);
    if (error) throw new Error("The reply could not be saved.");
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
    await requireAdmin(context.supabase, context.userId);
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    const { processDeletionQueue } = await import("./erasure.server");
    const result = await processDeletionQueue(admin);
    await admin.from("account_activity").insert({ owner_id: context.userId, event: "deletion_retry", detail: `${result.erased} of ${result.scanned} queued photos erased` });
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
    await requireAdmin(context.supabase, context.userId);
    if (data.userId === context.userId) throw new Error("You cannot pause your own account.");
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    const { error } = await admin.from("account_controls").upsert(
      { user_id: data.userId, blocked: data.blocked, reason: data.reason.trim() || null, set_by: context.userId, set_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
    if (error) throw new Error("The account state could not be saved.");
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
    await requireAdmin(context.supabase, context.userId);
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
    return { products, listings, problems: problems.slice(0, 10), skipped: problems.length };
  });

/* ------------------------------ label overrides ------------------------------ */

export const localeOverrides = createServerFn({ method: "GET" }).handler(async () => {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const supabasePublic = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: { fetch: (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
  const { data } = await supabasePublic.from("locale_overrides").select("locale, label_key, label_value");
  return data ?? [];
});

export const adminSetLocaleOverride = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ locale: z.string().min(2).max(10), key: z.string().min(1).max(60), value: z.string().min(1).max(400) }).parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("locale_overrides").upsert(
      { locale: data.locale, label_key: data.key, label_value: data.value, updated_at: new Date().toISOString() },
      { onConflict: "locale,label_key" },
    );
    if (error) throw new Error("The label could not be saved.");
    return { success: true };
  });

export const adminDeleteLocaleOverride = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ locale: z.string().min(2).max(10), key: z.string().min(1).max(60) }).parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("locale_overrides").delete().eq("locale", data.locale).eq("label_key", data.key);
    if (error) throw new Error("The label could not be removed.");
    return { success: true };
  });
