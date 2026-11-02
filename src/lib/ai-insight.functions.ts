import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { METRICS, type Metrics } from "./skin";

const input = z.object({ checkInId: z.string().uuid(), age: z.number().int().min(13).max(100) });

/** Non-diagnostic AI explanation of the caller's own latest scan. Reads metrics server-side via RLS so they cannot be forged. */
export const explainScan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((v: unknown) => input.parse(v))
  .handler(async ({ data, context }) => {
    const { data: checkIn } = await context.supabase.from("check_ins").select("metrics,overall_score,profile_id").eq("id", data.checkInId).single();
    if (!checkIn) return { error: "We couldn't find that check-in." };
    const { data: person } = await context.supabase.from("person_profiles").select("pregnancy,allergies,skin_type").eq("id", checkIn.profile_id).single();
    const metrics = (checkIn.metrics ?? {}) as Metrics;
    const lines = METRICS.filter((m) => typeof metrics[m.key] === "number").map((m) => `${m.label}: ${metrics[m.key]}/100`).join("\n");
    if (!lines) return { error: "This check-in has no scores to explain yet." };
    const apiKey = process.env['LOVABLE_API_KEY'];
    if (!apiKey) return { error: "AI insights aren't configured yet." };

    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText } = await import("ai");
    const openai = createOpenAI({ baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" } });
    const prompt = `Age: ${data.age}\nSkin type: ${person?.skin_type ?? "not given"}\nPregnant or breastfeeding: ${person?.pregnancy ? "yes" : "no"}\nAllergies: ${person?.allergies || "none listed"}\nOverall score: ${checkIn.overall_score}/100 (higher is better)\n${lines}`;
    try {
      const result = streamText({
        model: openai.responses("openai/gpt-6-astra"),
        maxRetries: 0,
        system: "You are a friendly cosmetic skincare coach inside Skin Twin AI. Scores are cosmetic appearance estimates from a photo (0-100, higher is better), NOT medical findings. Never diagnose, name diseases or conditions, or prescribe medication. Use soft language like 'looks', 'appears'. Respect pregnancy and allergies (avoid retinoids/salicylic acid in pregnancy; avoid listed allergens). Tailor to the age given. Reply in plain English, no markdown symbols, with exactly these sections each on its own line followed by short lines starting with '- ': 'What your scores suggest' (2-3 lines), 'Your next steps' (3-4 concrete actions for the coming week), 'For your age' (1-2 lines), 'When to see a professional' (1 line). Under 220 words.",
        prompt,
        providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", store: false, include: ["reasoning.encrypted_content"] } },
      });
      const text = (await result.text).trim();
      if (!text) return { error: "The AI couldn't write an explanation this time. Please try again later." };
      return { text };
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      console.error("explainScan failed", status, e);
      if (status === 429) return { error: "Too many requests right now. Please wait a minute and try again." };
      if (status === 402 || status === 403) return { error: "AI insights are temporarily unavailable." };
      return { error: "Something went wrong creating your insight. Please try again." };
    }
  });
