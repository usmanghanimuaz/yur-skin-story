import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { explainScan } from "@/lib/ai-insight.functions";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CalendarDays, Camera, Download, Droplets, Sparkles, TrendingUp, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActivePerson } from "@/hooks/use-active-person";
import { accountOptions, checkInsOptions, logActivity } from "@/lib/data";
import { demoChecks, demoPerson } from "@/lib/demo";
import { ageGuide, buildAdvice } from "@/lib/advice";
import { type Metrics, scoreLabel, delta, metricLabel, weakestMetrics } from "@/lib/skin";
import { ScoreRing, MetricGrid, Delta, CheckInPhoto } from "./score";
import { downloadPdf } from "@/lib/downloads";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const BAND_AGE: Record<string, number> = { "under-18": 16, "18-24": 21, "25-34": 30, "35-44": 40, "45-54": 50, "55+": 60 };
function AiInsight({ checkInId, ageBand, sample }: { checkInId: string; ageBand?: string | null; sample: boolean }) {
  const [age, setAge] = useState(String(BAND_AGE[ageBand ?? ""] ?? ""));
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const explain = useServerFn(explainScan);
  const run = async () => {
    const n = Number(age);
    if (!Number.isInteger(n) || n < 13 || n > 100) { setError("Enter an age between 13 and 100."); return; }
    setBusy(true); setError(""); setText("");
    try { const r = await explain({ data: { checkInId, age: n } }); if ("error" in r && r.error) setError(r.error); else if ("text" in r) setText(r.text ?? ""); }
    catch { setError("Couldn't reach Skin Twin AI. Check your connection and try again."); }
    finally { setBusy(false); }
  };
  return <section className="mt-10 rounded-2xl border bg-card p-6" aria-labelledby="ai-insight"><div className="flex items-center gap-2"><Sparkles className="size-5 text-rose" /><h2 id="ai-insight" className="text-3xl">Understand your latest scan</h2></div><p className="mt-2 text-xs leading-6 text-muted-foreground">Uses your latest check-in scores and your age to explain what they suggest and what to try next. Cosmetic guidance only, not a diagnosis.</p>
    {sample ? <p className="mt-4 text-sm text-muted-foreground">Sign in and complete a real check-in to get a personal AI insight.</p> : <div className="mt-4 flex flex-wrap items-end gap-3"><div className="space-y-1"><Label htmlFor="ai-age">Your age</Label><Input id="ai-age" type="number" inputMode="numeric" min={13} max={100} value={age} onChange={(e) => setAge(e.target.value)} className="h-11 w-28 rounded-xl" /></div><Button className="h-11 rounded-full" onClick={run} disabled={busy}>{busy ? <><Loader2 className="animate-spin" /> Thinking…</> : text ? "Refresh insight" : "Explain my scan"}</Button></div>}
    {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
    {text && <div className="mt-5 whitespace-pre-line rounded-xl bg-secondary/60 p-5 text-sm leading-7" aria-live="polite">{text}</div>}
    {text && <p className="mt-3 text-xs text-muted-foreground">AI-generated. Patch test new products and ask a professional about persistent concerns.</p>}
  </section>;
}

export function EmptyState({ title = "Your skin twin starts here", text = "Your first check-in gives you a starting point. A close-up photo is all you need.", to = "/check-in", action = "Take your first photo" }: { title?: string; text?: string; to?: "/check-in" | "/welcome" | "/manage-profiles"; action?: string }) {
  return <div className="flex flex-col items-center py-20 text-center"><div className="mb-5 grid size-16 place-items-center rounded-full bg-secondary"><Camera className="size-7 text-primary" /></div><h2 className="text-4xl">{title}</h2><p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">{text}</p><Button asChild className="mt-7 rounded-full"><Link to={to}>{action}<ArrowUpRight /></Link></Button></div>;
}

export function Dashboard({ sample = false }: { sample?: boolean }) {
  const { active, loading } = useActivePerson();
  const { data: rows = [], isLoading } = useQuery({ ...checkInsOptions(active?.id ?? ""), enabled: !sample && Boolean(active) });
  const { data: acct } = useQuery({ ...accountOptions, enabled: !sample });
  const person = sample ? demoPerson : active;
  const checks = sample ? demoChecks : rows;
  if (!sample && (loading || isLoading)) return <div className="py-20 text-center text-muted-foreground">Loading your skin twin…</div>;
  if (!sample && acct && !acct.account.onboarded) return <EmptyState title="Let's finish setting up" text={`You're on step ${Math.min(acct.account.onboarding_step + 1, 4)} of 4. Pick up where you left off.`} to="/welcome" action="Continue setup" />;
  if (!person) return <EmptyState title="Let's meet your skin twin" text="Set up your first person profile to start tracking." to="/welcome" action="Set up my profile" />;
  const latest = checks[0];
  const previous = checks[1];
  const metrics = (latest?.metrics ?? {}) as Metrics;
  const advice = buildAdvice(metrics, { pregnancy: person.pregnancy, allergies: person.allergies, skin_type: person.skin_type, age_band: person.age_band });
  const guide = ageGuide(person.age_band);
  const focus = weakestMetrics(metrics, 1)[0];
  const due = !sample && acct?.account.weekly_reminder && (!latest || Date.now() - new Date(latest.check_in_date).getTime() >= 7 * 86400000);
  const exportReport = async () => {
    if (!checks.length) return;
    await downloadPdf(person.name, checks.map((c) => ({ ...c, metrics: c.metrics as Metrics })));
    if (!sample) await logActivity("data_export", "PDF progress report");
  };
  return <>
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-xs text-muted-foreground">YOUR PERSONAL SKIN JOURNEY</p><h1 className="text-4xl sm:text-5xl">A little insight, <i>a little progress.</i></h1><p className="mt-3 text-sm text-muted-foreground">{person.name}'s skin, one check-in at a time.</p></div><Button variant="outline" className="rounded-full" onClick={exportReport} disabled={!latest}><Download /> Export report</Button></div>
    {due && <div className="mb-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-secondary/60 px-5 py-4"><div className="flex items-center gap-3"><CalendarDays className="size-5 text-primary" /><p className="text-sm">It's time for your weekly check-in.</p></div><Button asChild variant="link"><Link to="/check-in">Take a new photo <ArrowUpRight /></Link></Button></div>}
    {!latest ? <EmptyState /> : <>
      <div className="grid gap-5 lg:grid-cols-[1.1fr_1.5fr]">
        <div className="rounded-2xl border bg-card p-6"><div className="flex items-center justify-between"><span className="text-sm font-medium">Your latest snapshot</span><span className="text-xs text-muted-foreground">{new Date(latest.check_in_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span></div><div className="mt-6 flex items-center gap-6"><ScoreRing score={latest.overall_score} /><div><p className="text-xs text-muted-foreground">OVERALL SKIN SCORE</p><h2 className="mt-2 text-3xl">{scoreLabel(latest.overall_score)}</h2><div className="mt-3"><Delta value={delta(latest.overall_score, previous?.overall_score)} suffix=" since last check-in" /></div><p className="mt-4 text-xs text-muted-foreground">{sample ? "Illustrative sample" : "YouCam Skin AI"}</p></div></div></div>
        <div className="rounded-2xl border bg-card p-6"><div className="flex items-center justify-between"><span className="text-sm font-medium">The bigger picture</span><span className="rounded-full bg-secondary px-2 py-1 text-[10px] text-muted-foreground">{checks.length} CHECK-INS</span></div><TrendChart checks={checks.map((c) => ({ date: c.check_in_date, score: c.overall_score }))} /><div className="flex items-center gap-2 text-xs text-muted-foreground"><TrendingUp className="size-4 text-primary" /> Consistency tells a better story than a single score.</div></div>
      </div>
      <div className="mb-5 mt-10 flex items-end justify-between"><div><p className="text-xs text-rose">THE DETAILS</p><h2 className="mt-1 text-3xl">Your skin, concern by concern.</h2></div><span className="hidden text-xs text-muted-foreground sm:inline">Higher scores mean a healthier-looking appearance</span></div>
      <MetricGrid metrics={metrics} {...(previous ? { previous: previous.metrics as Metrics } : {})} />
      <AiInsight key={latest.id} checkInId={latest.id} ageBand={person.age_band} sample={sample} /><div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]"><div><div className="mb-5 flex items-center justify-between"><h2 className="text-3xl">A little care, tailored to you.</h2><Sparkles className="size-5 text-rose" /></div><div className="grid gap-3 sm:grid-cols-2">{advice.map((a) => <div key={a.key} className="rounded-2xl border bg-card p-5"><span className="text-[10px] font-medium uppercase text-rose">{metricLabel(a.concern)}</span><h3 className="mt-2 text-2xl">{a.title}</h3><p className="mt-2 text-xs leading-6 text-muted-foreground">{a.detail}</p>{a.caution && <p className="mt-2 text-xs text-rose">{a.caution}</p>}<div className="mt-4 flex items-center justify-between"><span className="text-[10px] text-muted-foreground">Patch test before use</span><div className="flex gap-1">{[true,false].map((helpful) => <Button key={String(helpful)} size="icon" variant="ghost" aria-label={helpful ? "Helpful advice" : "Not helpful advice"} onClick={async () => { if (sample) { toast("Sample feedback — not saved"); return; } const { error } = await supabase.from("advice_feedback").upsert({ check_in_id: latest.id, recommendation_key: a.key, helpful }, { onConflict: "owner_id,check_in_id,recommendation_key" }); if (error) toast.error("Could not save feedback"); else toast.success("Thanks for your feedback"); }}>{helpful ? <ThumbsUp /> : <ThumbsDown />}</Button>)}</div></div></div>)}</div>{guide && <div className="mt-4 rounded-2xl border bg-secondary/60 p-5"><span className="text-[10px] font-medium uppercase text-rose">For age {guide.band}</span><h3 className="mt-2 text-2xl">{guide.title}</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-6 text-muted-foreground">{guide.tips.map((t) => <li key={t}>{t}</li>)}</ul><p className="mt-3 text-xs text-muted-foreground">Ingredients often chosen at this age: {guide.preferIngredients.join(", ")}.</p></div>}<p className="mt-3 text-xs text-muted-foreground">General cosmetic guidance, not a prescription. Ask a professional about pregnancy, allergies or persistent concerns.</p></div><div><h2 className="mb-5 text-3xl">Your recent moments.</h2><div className="space-y-3">{checks.slice(0, 3).map((c) => <Link key={c.id} to={sample ? "/demo" : "/check-in/$id"} params={{ id: c.id }} className="flex items-center gap-4 rounded-2xl border bg-card p-3"><CheckInPhoto path={c.photo_path} sample={sample} className="size-16 shrink-0 rounded-xl" /><div className="flex-1"><p className="text-sm">{new Date(c.check_in_date).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}</p><p className="mt-1 text-xs text-muted-foreground">{c.notes || "Weekly skin check-in"}</p></div><span className="font-display text-3xl">{c.overall_score}</span><ArrowUpRight className="size-4 text-muted-foreground" /></Link>)}</div>{focus && <div className="mt-5 border-t pt-5"><p className="flex items-center gap-2 text-sm"><Droplets className="size-4 text-rose" /> A little focus on {metricLabel(focus).toLowerCase()}</p><p className="mt-2 text-xs leading-6 text-muted-foreground">Keep your lighting and camera angle similar next week for a more consistent comparison.</p></div>}</div></div>
    </>}
  </>;
}

export function TrendChart({ checks }: { checks: { date: string; score: number }[] }) {
  const rows = [...checks].reverse();
  const points = rows.map((c,i) => `${30 + i * (420 / Math.max(rows.length - 1, 1))},${160 - c.score * 1.3}`).join(" ");
  return <div className="my-5"><svg viewBox="0 0 480 180" className="h-36 w-full" role="img" aria-label="Overall score trend">{[40,60,80,100].map((v) => <g key={v}><line x1="30" x2="460" y1={160-v*1.3} y2={160-v*1.3} stroke="var(--border)" strokeDasharray="3 5" /><text x="2" y={164-v*1.3} fill="var(--muted-foreground)" fontSize="10">{v}</text></g>)}<polyline points={points} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinejoin="round" />{rows.map((c,i) => <circle key={c.date} cx={30+i*(420/Math.max(rows.length-1,1))} cy={160-c.score*1.3} r="4" fill="var(--primary)" />)}</svg><div className="flex justify-between text-[10px] text-muted-foreground">{rows.filter((_,i) => i===0 || i===rows.length-1).map((c) => <span key={c.date}>{new Date(c.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>)}</div></div>;
}