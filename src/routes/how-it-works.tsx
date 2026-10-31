import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, ShieldCheck, Sparkles, ChartNoAxesCombined, ListChecks, Users, Download, Trash2, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicShell } from "@/components/app/public-shell";
import { ResultsShowcase } from "@/components/app/results-showcase";
import { METRICS } from "@/lib/skin";
import { pageHead } from "@/lib/seo";
import photo from "@/assets/how-photo.jpg";

export const Route = createFileRoute("/how-it-works")({
  head: () => pageHead("How SkinTwin works", "From one close-up photo to a private, week-by-week picture of your skin: capture, analyse, track, compare and care."),
  component: Page,
});

const STEPS = [
  [Camera, "Capture", "Take or upload one close-up in daylight. Face the camera, no filters or makeup, face filling most of the frame."],
  [ShieldCheck, "Store privately", "Your photo goes to private storage under your account only. It is never public and is viewed through short-lived links."],
  [Sparkles, "Analyse", "Our server sends the photo to YouCam Skin AI. Only genuine YouCam results are saved as a check-in — never invented scores."],
  [ListChecks, "Read your report", "See an overall skin score and a breakdown across 11 cosmetic concerns, with plain-language notes."],
  [ChartNoAxesCombined, "Track & compare", "Check in weekly. Your history shows trends and you can compare any two check-ins side by side."],
  [Sparkles, "Get gentle advice", "Rule-based suggestions that respect your sensitivities, pregnancy status and current actives."],
] as const;

function Page() {
  return <PublicShell>
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2">
      <div>
        <p className="text-xs font-medium tracking-widest text-rose">HOW IT WORKS</p>
        <h1 className="mt-3 text-5xl sm:text-7xl">One photo a week.<span className="block italic text-primary">A clearer picture.</span></h1>
        <p className="mt-6 max-w-md leading-7 text-muted-foreground">SkinTwin builds your digital skin twin: a private timeline of cosmetic skin insights that helps you see what is changing and what your routine is doing.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Button asChild size="lg" className="rounded-full"><Link to="/register">Start your journey <ArrowUpRight /></Link></Button><Button asChild size="lg" variant="outline" className="rounded-full"><Link to="/demo">Explore a sample</Link></Button></div>
      </div>
      <img src={photo} alt="Woman taking a close-up selfie by a window in daylight" width={1200} height={912} className="aspect-[4/3] w-full rounded-3xl object-cover" />
    </section>

    <section className="border-y bg-secondary/40"><div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <h2 className="text-4xl">Six simple steps</h2>
      <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{STEPS.map(([Icon, t, d], i) => <li key={t} className="rounded-3xl border bg-card p-6">
        <div className="flex items-center justify-between"><div className="grid size-11 place-items-center rounded-full bg-secondary text-primary"><Icon className="size-5" /></div><span className="font-display text-3xl text-rose/60">{String(i + 1).padStart(2, "0")}</span></div>
        <h3 className="mt-5 text-2xl">{t}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{d}</p>
      </li>)}</ol>
    </div></section>

    <ResultsShowcase />

    <section className="mx-auto grid max-w-7xl gap-12 px-5 pb-16 sm:px-8 lg:grid-cols-2">
      <div><h2 className="text-4xl">What we measure</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Each metric is scored 0–100, where higher means a healthier-looking result. They are cosmetic estimates from a photo, not clinical measurements.</p>
        <ul className="mt-6 grid grid-cols-2 gap-x-6">{METRICS.map((m) => <li key={m.key} className="border-b py-3 text-sm">{m.label}</li>)}</ul></div>
      <div className="grid gap-4 self-start">
        {[[Users, "Up to three people", "Track yourself and two others on one account, each with separate photos and history. Always get consent first."],
          [Download, "Your data, portable", "Download a PDF report or a machine-readable export of everything at any time."],
          [Trash2, "Delete for real", "Deleting a check-in or your account erases the stored photo file itself, not just the record."],
          [ShieldCheck, "Sample mode is labelled", "The demo uses clearly marked sample data. It is never saved as a real scan."]].map(([I, t, d]) => { const Icon = I as typeof Users; return <div key={String(t)} className="flex gap-4 rounded-2xl border p-5"><Icon className="mt-1 size-5 shrink-0 text-primary" /><div><h3 className="text-xl">{String(t)}</h3><p className="mt-1 text-sm text-muted-foreground">{String(d)}</p></div></div>; })}
      </div>
    </section>
  </PublicShell>;
}
