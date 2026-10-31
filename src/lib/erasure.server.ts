import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/** Idempotent: erases photo bytes only when no check-in still references the path. Failures stay pending for retry. */
export async function processDeletionQueue(admin: SupabaseClient<Database>, ownerId?: string) {
  let q = admin.from("photo_deletion_requests").select("*").eq("status", "pending").lt("attempts", 10).limit(200);
  if (ownerId) q = q.eq("owner_id", ownerId);
  const { data: queue } = await q;
  let erased = 0;
  for (const item of queue ?? []) {
    if (!item.photo_path.startsWith(`${item.owner_id}/`) || item.photo_path.includes("..")) {
      await admin.from("photo_deletion_requests").update({ status: "invalid", processed_at: new Date().toISOString() }).eq("id", item.id);
      continue;
    }
    const { count } = await admin.from("check_ins").select("id", { count: "exact", head: true }).eq("photo_path", item.photo_path);
    if (count !== 0) continue;
    const { error } = await admin.storage.from("checkin-photos").remove([item.photo_path]);
    if (error) {
      await admin.from("photo_deletion_requests").update({ attempts: item.attempts + 1, last_error: error.message.slice(0, 200) }).eq("id", item.id);
    } else {
      await admin.from("photo_deletion_requests").update({ status: "erased", processed_at: new Date().toISOString() }).eq("id", item.id);
      erased++;
    }
  }
  return { erased, scanned: queue?.length ?? 0 };
}
