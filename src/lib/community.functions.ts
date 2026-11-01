import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { pickSharedScans } from "./community";

export type SharedScan = { id: string; name: string; score: number; metrics: Record<string, number>; date: string; photoUrl: string };

// Public: returns only scans whose owners explicitly opted in. Photos get short-lived signed links.
export const listSharedScans = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.object({ limit: z.number().int().min(1).max(100).optional() }).parse(d ?? {}))
  .handler(async ({ data }): Promise<SharedScan[]> => {
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    const { data: owners } = await admin.from("profiles").select("user_id").eq("share_scans", true).limit(500);
    const ids = (owners ?? []).map((o) => o.user_id);
    if (!ids.length) return [];
    const [{ data: rows }, { data: people }, { data: blocked }] = await Promise.all([
      admin.from("check_ins").select("id,owner_id,profile_id,photo_path,overall_score,metrics,check_in_date").in("owner_id", ids).not("photo_path", "is", null).order("check_in_date", { ascending: false }).limit(2000),
      admin.from("person_profiles").select("id,user_id,name,is_me").in("user_id", ids).eq("is_me", true),
      admin.from("account_controls").select("user_id").eq("blocked", true).in("user_id", ids),
    ]);
    const paused = new Set((blocked ?? []).map((b) => b.user_id));
    const picked = pickSharedScans(rows ?? [], people ?? [], new Set(ids.filter((i) => !paused.has(i))), data.limit);
    const out: SharedScan[] = [];
    for (const p of picked) {
      const { data: s } = await admin.storage.from("checkin-photos").createSignedUrl(p.photo_path!, 3600);
      if (!s?.signedUrl) continue;
      const m = (p.metrics && typeof p.metrics === "object" ? p.metrics : {}) as Record<string, number>;
      out.push({ id: p.id, name: p.name, score: p.overall_score, metrics: m, date: p.check_in_date, photoUrl: s.signedUrl });
    }
    return out;
  });
