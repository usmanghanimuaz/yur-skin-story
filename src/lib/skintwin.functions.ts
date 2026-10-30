import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { normalizeYoucamScores, quotaWindows } from "./skin";
import { buildAdvice, safetyHash } from "./advice";
import type { Json } from "@/integrations/supabase/types";

const API = "https://yce-api-01.makeupar.com/s2s/v2.0";
const uuid = z.string().uuid();

export const analysisStatus = createServerFn({ method: "GET" }).handler(async () => ({
  configured: Boolean(process.env["YOUCAM_API_KEY"]),
}));

async function youcam(path: string, key: string, body?: unknown) {
  const res = await fetch(`${API}${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : null,
  });
  const out = await res.json() as { data?: Record<string, unknown>; error?: string; status?: number };
  if (!res.ok) throw new Error(res.status === 401 ? "YouCam credentials were rejected. Please contact the app owner." : "YouCam could not process this photo. Try a clear close-up in daylight.");
  return out;
}

export const startAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ profileId: uuid, photoPath: z.string().min(1).max(300), notes: z.string().max(1000).default("") }).parse(input))
  .handler(async ({ data, context }) => {
    const key = process.env["YOUCAM_API_KEY"];
    if (!key) throw new Error("Live analysis is not connected yet. Sample mode never saves a real scan.");
    const { data: person } = await context.supabase.from("person_profiles").select("id").eq("id", data.profileId).eq("user_id", context.userId).single();
    if (!person || !data.photoPath.startsWith(`${context.userId}/`) || data.photoPath.includes("..")) throw new Error("Photo or profile not found.");
    const { data: file, error: fileError } = await context.supabase.storage.from("checkin-photos").download(data.photoPath);
    if (fileError || !file || file.size > 10 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Please upload a JPG, PNG or WebP photo under 10 MB.");
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    const windows = quotaWindows(new Date());
    const { error: quotaError } = await admin.rpc("reserve_analysis_quota", { p_owner: context.userId, p_short: windows.tenMin, p_day: windows.day, p_app: windows.appDay });
    if (quotaError) throw new Error(quotaError.message);
    const { data: upload, error: uploadError } = await admin.from("photo_uploads").insert({ owner_id: context.userId, profile_id: data.profileId, photo_path: data.photoPath, notes: data.notes, status: "claimed", quota_windows: windows }).select("id").single();
    if (uploadError || !upload) {
      await admin.rpc("release_analysis_quota", { p_owner: context.userId, p_short: windows.tenMin, p_day: windows.day, p_app: windows.appDay });
      throw new Error("This photo has already been submitted. Choose a new photo.");
    }
    try {
      const registered = await youcam("/file", key, { files: [{ content_type: file.type, file_name: "skintwin-photo", file_size: file.size }] });
      const files = registered.data?.["files"] as { file_id: string; requests: { url: string; method: string; headers: Record<string, string> }[] }[] | undefined;
      const first = files?.[0];
      const request = first?.requests?.[0];
      if (!first || !request) throw new Error("YouCam upload could not be initialized.");
      const target = new URL(request.url);
      if (target.protocol !== "https:" || !target.hostname.endsWith(".amazonaws.com")) throw new Error("Unexpected upload destination from YouCam.");
      const uploaded = await fetch(request.url, { method: request.method, headers: request.headers, body: file });
      if (!uploaded.ok) throw new Error("Photo could not be sent for analysis. Please try again.");
      const task = await youcam("/task/skin-analysis", key, { src_file_id: first.file_id, dst_actions: ["wrinkle", "pore", "texture", "acne", "firmness", "moisture", "age_spot", "redness", "oiliness", "radiance", "dark_circle_v2"], format: "json" });
      const taskId = task.data?.["task_id"];
      if (typeof taskId !== "string") throw new Error("YouCam did not return an analysis reference.");
      await admin.from("photo_uploads").update({ task_id: taskId, status: "running" }).eq("id", upload.id);
      return { uploadId: upload.id };
    } catch (err) {
      await admin.from("photo_uploads").update({ status: "rejected" }).eq("id", upload.id);
      await admin.rpc("release_analysis_quota", { p_owner: context.userId, p_short: windows.tenMin, p_day: windows.day, p_app: windows.appDay });
      await admin.from("photo_deletion_requests").insert({ owner_id: context.userId, photo_path: data.photoPath });
      throw err;
    }
  });

export const pollAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ uploadId: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    const { data: upload } = await admin.from("photo_uploads").select("*").eq("id", data.uploadId).eq("owner_id", context.userId).single();
    if (!upload) throw new Error("Analysis not found.");
    if (upload.check_in_id) return { status: "success", checkInId: upload.check_in_id };
    if (upload.status === "rejected") throw new Error("This photo was rejected. Please try a clear face close-up.");
    const key = process.env["YOUCAM_API_KEY"];
    if (!key || !upload.task_id || !upload.profile_id) throw new Error("Analysis is not available.");
    const result = await youcam(`/task/skin-analysis/${encodeURIComponent(upload.task_id)}`, key);
    const status = result.data?.["task_status"];
    if (status !== "success" && status !== "error") return { status: "running", checkInId: null };
    if (status === "error") {
      const { data: rejected } = await admin.from("photo_uploads").update({ status: "rejected" }).eq("id", upload.id).eq("status", "running").select("id");
      if (rejected?.length) {
        const w = upload.quota_windows as { tenMin: string; day: string; appDay: string };
        await admin.rpc("release_analysis_quota", { p_owner: context.userId, p_short: w.tenMin, p_day: w.day, p_app: w.appDay });
        await admin.from("photo_deletion_requests").insert({ owner_id: context.userId, photo_path: upload.photo_path });
      }
      throw new Error("YouCam could not detect a suitable face. Use a well-lit close-up without filters.");
    }
    const normalized = normalizeYoucamScores(result.data);
    if (!normalized) throw new Error("YouCam returned a result format that needs review. No scores were invented or saved.");
    const { data: claimed } = await admin.from("photo_uploads").update({ status: "saving" }).eq("id", upload.id).eq("status", "running").select("id");
    if (!claimed?.length) return { status: "running", checkInId: null };
    const { data: checkIn, error } = await admin.from("check_ins").insert({ owner_id: context.userId, profile_id: upload.profile_id, photo_path: upload.photo_path, overall_score: normalized.overall, metrics: normalized.metrics as Json, engine: "youcam", engine_scores: result.data as Json, notes: upload.notes }).select("id").single();
    if (error || !checkIn) {
      await admin.from("photo_uploads").update({ status: "running" }).eq("id", upload.id);
      throw new Error("Your result could not be saved. Please retry.");
    }
    await admin.from("photo_uploads").update({ status: "analysed", check_in_id: checkIn.id }).eq("id", upload.id);
    return { status: "success", checkInId: checkIn.id };
  });

export const deleteRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ kind: z.enum(["check-in", "person"]), id: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: rows } = await context.supabase.from("check_ins").select("id,photo_path").eq(data.kind === "person" ? "profile_id" : "id", data.id).eq("owner_id", context.userId);
    if (data.kind === "person") {
      const { data: person } = await context.supabase.from("person_profiles").select("id").eq("id", data.id).eq("user_id", context.userId).single();
      if (!person) throw new Error("Profile not found.");
    } else if (!rows?.length) throw new Error("Check-in not found.");
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    const photos = (rows ?? []).filter((r) => r.photo_path);
    if (photos.length) {
      const { error } = await admin.from("photo_deletion_requests").upsert(photos.map((r) => ({ owner_id: context.userId, photo_path: r.photo_path ?? "", check_in_id: r.id })), { onConflict: "check_in_id" });
      if (error) throw new Error("Deletion could not be queued. Please retry.");
    }
    const { error } = data.kind === "person"
      ? await admin.from("person_profiles").delete().eq("id", data.id).eq("user_id", context.userId)
      : await admin.from("check_ins").delete().eq("id", data.id).eq("owner_id", context.userId);
    if (error) throw new Error("Could not delete this record.");
    // Process this owner's queue immediately; transient failures remain queued for the next attempt.
    const { data: queue } = await admin.from("photo_deletion_requests").select("*").eq("owner_id", context.userId).eq("status", "pending").limit(100);
    for (const item of queue ?? []) {
      const { count } = await admin.from("check_ins").select("id", { count: "exact", head: true }).eq("photo_path", item.photo_path);
      if (count !== 0 || !item.photo_path.startsWith(`${context.userId}/`)) continue;
      const { error: erased } = await admin.storage.from("checkin-photos").remove([item.photo_path]);
      if (!erased) await admin.from("photo_deletion_requests").update({ status: "erased", processed_at: new Date().toISOString() }).eq("id", item.id);
    }
    return { success: true };
  });

export const getAdvice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ checkInId: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: checkIn } = await context.supabase.from("check_ins").select("metrics,profile_id").eq("id", data.checkInId).single();
    if (!checkIn) throw new Error("Check-in not found.");
    const { data: person } = await context.supabase.from("person_profiles").select("*").eq("id", checkIn.profile_id).single();
    if (!person) throw new Error("Profile not found.");
    const { data: products } = await context.supabase.from("skin_products").select("actives").eq("profile_id", person.id).is("stopped_date", null);
    const safety = { ...person, currentActives: (products ?? []).map((p) => p.actives ?? "") };
    const hash = safetyHash(safety);
    const payload = buildAdvice(checkIn.metrics as import("./skin").Metrics, safety);
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    await admin.from("skin_advice").upsert({ owner_id: context.userId, check_in_id: data.checkInId, safety_hash: hash, payload: payload as unknown as Json }, { onConflict: "check_in_id,safety_hash" });
    return payload;
  });