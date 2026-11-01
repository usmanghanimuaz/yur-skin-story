import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, ShieldCheck, Sparkles, ChartNoAxesCombined, ListChecks, Users, Download, Trash2, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicShell } from "@/components/app/public-shell";
import { ResultsShowcase } from "@/components/app/results-showcase";
import { METRICS } from "@/lib/skin";
import { pageHead } from "@/lib/seo";
import { useContent } from "@/lib/content";
import photo from "@/assets/how-photo.jpg";

export const Route = createFileRoute("/how-it-works")({
  head: () => pageHead("How Your Skin Story works", "From one close-up photo to a private, week-by-week picture of your skin: capture, analyse, track, compare and care."),
  component: Page,
});

const ICONS = [Camera, ShieldCheck, Sparkles, ListChecks, ChartNoAxesCombined, Sparkles] as const;
const CARD_ICONS = [Users, Download, Trash2, ShieldCheck] as const;

function Page() {
  const { c } = useContent();
  return <PublicShell>
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2">
      <div>
        <p className="text-xs font-medium tracking-widest text-rose">{c("how-it-works", "hero_eyebrow")}</p>
        <h1 className="mt-3 text-5xl sm:text-7xl">{c("how-it-works", "hero_title")}<span className="block italic text-primary">{c("how-it-works", "hero_sub")}</span></h1>
        <p className="mt-6 max-w-md leading-7 text-muted-foreground">{c("how-it-works", "hero_lead")}</p>
        <div className="mt-8 flex flex-wrap gap-3"><Button asChild size="lg" className="rounded-full"><Link to="/register">{c("how-it-works", "cta_main")} <ArrowUpRight /></Link></Button><Button asChild size="lg" variant="outline" className="rounded-full"><Link to="/demo">{c("how-it-works", "cta_sample")}</Link></Button></div>
      </div>
      <img src={photo} alt="Woman taking a close-up selfie by a window in daylight" width={1200} height={912} className="aspect-[4/3] w-full rounded-3xl object-cover" />
    </section>

    <section className="border-y bg-secondary/40"><div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <h2 className="text-4xl">{c("how-it-works", "steps_title")}</h2>
      <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{ICONS.map((Icon, i) => <li key={i} className="rounded-3xl border bg-card p-6">
        <div className="flex items-center justify-between"><div className="grid size-11 place-items-center rounded-full bg-secondary text-primary"><Icon className="size-5" /></div><span className="font-display text-3xl text-rose/60">{String(i + 1).padStart(2, "0")}</span></div>
        <h3 className="mt-5 text-2xl">{c("how-it-works", `step${i + 1}_title`)}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{c("how-it-works", `step${i + 1}_text`)}</p>
      </li>)}</ol>
    </div></section>

    <ResultsShowcase />

    <section className="mx-auto grid max-w-7xl gap-12 px-5 pb-16 sm:px-8 lg:grid-cols-2">
      <div><h2 className="text-4xl">{c("how-it-works", "measure_title")}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{c("how-it-works", "measure_lead")}</p>
        <ul className="mt-6 grid grid-cols-2 gap-x-6">{METRICS.map((m) => <li key={m.key} className="border-b py-3 text-sm">{m.label}</li>)}</ul></div>
      <div className="grid gap-4 self-start">{CARD_ICONS.map((Icon, i) => <div key={i} className="flex gap-4 rounded-2xl border p-5"><Icon className="mt-1 size-5 shrink-0 text-primary" /><div><h3 className="text-xl">{c("how-it-works", `card${i + 1}_title`)}</h3><p className="mt-1 text-sm text-muted-foreground">{c("how-it-works", `card${i + 1}_text`)}</p></div></div>)}</div>
    </section>
  </PublicShell>;
}
