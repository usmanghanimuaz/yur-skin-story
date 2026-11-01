import { SharedScansSlider } from "./shared-scans";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Camera, ChartNoAxesCombined, ShieldCheck, Sparkles, Heart, Check, ArrowRight, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PublicShell } from "./public-shell";
import { ScoreRing, Delta } from "./score";
import { METRICS } from "@/lib/skin";
import { ResultsShowcase } from "./results-showcase";
import { useContent } from "@/lib/content";
import hero from "@/assets/skintwin-portrait.jpg";

export function Landing() {
  const { c } = useContent();
  return <PublicShell>
    <section className="relative overflow-hidden">
      <img src={hero} alt="Natural close-up skin portrait" width={1600} height={1024} className="absolute inset-0 size-full object-cover object-right" />
      <div className="absolute inset-0 bg-background/70 md:bg-background/15 dark:bg-background/80" />
      <div className="relative mx-auto flex min-h-[575px] max-w-7xl items-center px-5 py-14 sm:px-8 md:min-h-[630px]">
        <div className="max-w-[550px]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/75 px-3.5 py-1.5 text-xs font-medium text-primary"><Sparkles className="size-3.5" /> {c("landing", "hero_eyebrow")}</div>
          <h1 className="text-[64px] leading-[1.02] sm:text-[84px]">{c("landing", "hero_title")}<span className="mt-3 block text-[48px] italic text-primary sm:text-[64px]">{c("landing", "hero_sub")}</span></h1>
          <p className="mt-6 max-w-sm text-base leading-7 text-muted-foreground">{c("landing", "hero_lead")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3"><Button asChild size="lg" className="h-12 rounded-full px-6"><Link to="/register">{c("landing", "hero_cta_main")} <ArrowUpRight /></Link></Button><Button asChild variant="outline" size="lg" className="h-12 rounded-full bg-background/70 px-5"><Link to="/demo">{c("landing", "hero_cta_sample")} <ArrowRight /></Link></Button></div>
          <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><Check className="size-3.5 text-primary" /> {c("landing", "hero_point_1")}</span><span className="flex items-center gap-1.5"><LockKeyhole className="size-3.5 text-primary" /> {c("landing", "hero_point_2")}</span></div>
        </div>
        <div className="absolute bottom-9 right-7 hidden w-56 rounded-2xl border bg-card/95 p-4 shadow-lg lg:block">
          <div className="mb-3 flex justify-between text-xs"><span className="font-medium">{c("landing", "snapshot_title")}</span><span className="text-muted-foreground">SAMPLE</span></div>
          <div className="flex items-center gap-4"><ScoreRing score={78} size={92} /><div><span className="font-display text-xl">Looking balanced</span><div className="mt-2"><Delta value={6} suffix=" this month" /></div></div></div>
          <div className="mt-4 border-t pt-3 text-xs text-muted-foreground">{c("landing", "snapshot_note")}</div>
        </div>
      </div>
    </section>
    <div className="border-y bg-card"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-5 text-xs sm:px-8"><span className="font-medium text-muted-foreground">{c("landing", "strip_title")}</span><span className="flex items-center gap-2"><Camera className="size-4 text-primary" /> {c("landing", "strip_1")}</span><span className="flex items-center gap-2"><ChartNoAxesCombined className="size-4 text-rose" /> {c("landing", "strip_2")}</span><span className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> {c("landing", "strip_3")}</span></div></div>
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="mb-3 text-xs font-medium text-rose">{c("landing", "rhythm_eyebrow")}</p><h2 className="text-4xl sm:text-5xl">{c("landing", "rhythm_title")}</h2></div><p className="max-w-xs text-sm leading-6 text-muted-foreground">{c("landing", "rhythm_lead")}</p></div>
      <div className="mt-10 grid gap-8 md:grid-cols-3">{[
        [Camera, "01", c("landing", "step1_title"), c("landing", "step1_text")],
        [Sparkles, "02", c("landing", "step2_title"), c("landing", "step2_text")],
        [ChartNoAxesCombined, "03", c("landing", "step3_title"), c("landing", "step3_text")],
      ].map(([Icon, no, title, text]) => { const I = Icon as typeof Camera; return <div key={String(no)} className="border-t pt-6"><div className="flex items-center justify-between"><div className="grid size-12 place-items-center rounded-full bg-secondary text-primary"><I className="size-5" /></div><span className="font-display text-3xl text-rose/60">{String(no)}</span></div><h3 className="mt-6 text-2xl">{String(title)}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{String(text)}</p></div>; })}</div>
    </section>
    <ResultsShowcase />
    <section className="border-y bg-secondary/40"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_1.15fr]"><div><p className="mb-3 text-xs font-medium text-rose">{c("landing", "details_eyebrow")}</p><h2 className="text-4xl sm:text-5xl">{c("landing", "details_title")}</h2><p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">{c("landing", "details_lead")}</p><Button asChild variant="link" className="mt-4 px-0"><Link to="/how-it-works">{c("landing", "details_cta")} <ArrowRight /></Link></Button></div><div className="grid grid-cols-2 gap-x-7 gap-y-4 sm:grid-cols-3">{METRICS.map((m) => <div key={m.key} className="flex items-center gap-2 border-b py-3 text-sm"><span className="size-1.5 rounded-full bg-rose" />{m.label}</div>)}</div></div></section>
    <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 md:grid-cols-2"><div className="flex gap-5"><div className="grid size-14 shrink-0 place-items-center rounded-full bg-secondary"><ShieldCheck className="size-6 text-primary" /></div><div><h3 className="text-3xl">{c("landing", "privacy_title")}</h3><p className="mt-4 text-sm leading-7 text-muted-foreground">{c("landing", "privacy_text")}</p><Button asChild variant="link" className="mt-2 px-0"><Link to="/privacy">{c("landing", "privacy_cta")} <ArrowUpRight /></Link></Button></div></div><div className="flex gap-5"><div className="grid size-14 shrink-0 place-items-center rounded-full bg-secondary"><Heart className="size-6 text-rose" /></div><div><h3 className="text-3xl">{c("landing", "people_title")}</h3><p className="mt-4 text-sm leading-7 text-muted-foreground">{c("landing", "people_text")}</p><Button asChild variant="link" className="mt-2 px-0"><Link to="/register">{c("landing", "people_cta")} <ArrowUpRight /></Link></Button></div></div></section>
    <SharedScansSlider />
    <section className="mx-auto max-w-3xl px-5 pb-20"><p className="text-center text-xs font-medium text-rose">{c("landing", "faq_eyebrow")}</p><h2 className="mt-3 text-center text-4xl">{c("landing", "faq_title")}</h2><Accordion type="single" collapsible className="mt-8">{[
      [c("landing", "faq1_q"), c("landing", "faq1_a")],
      [c("landing", "faq2_q"), c("landing", "faq2_a")],
      [c("landing", "faq3_q"), c("landing", "faq3_a")],
      [c("landing", "faq4_q"), c("landing", "faq4_a")],
    ].map(([q, a], i) => <AccordionItem value={String(i)} key={q}><AccordionTrigger className="text-left text-sm">{q}</AccordionTrigger><AccordionContent className="text-sm leading-6 text-muted-foreground">{a}</AccordionContent></AccordionItem>)}</Accordion></section>
    <section className="bg-primary text-primary-foreground"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-5 py-14 sm:px-8"><div><h2 className="text-4xl sm:text-5xl">{c("landing", "cta_title")}</h2><p className="mt-3 text-sm opacity-75">{c("landing", "cta_text")}</p></div><Button asChild variant="secondary" size="lg" className="h-12 rounded-full"><Link to="/register">{c("landing", "cta_button")} <ArrowUpRight /></Link></Button></div></section>
  </PublicShell>;
}
