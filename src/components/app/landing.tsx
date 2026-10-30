import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Camera, ChartNoAxesCombined, ShieldCheck, Sparkles, Heart, Check, ArrowRight, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PublicShell } from "./public-shell";
import { ScoreRing, Delta } from "./score";
import { METRICS } from "@/lib/skin";
import hero from "@/assets/skintwin-portrait.jpg";

export function Landing() {
  return <PublicShell>
    <section className="relative overflow-hidden">
      <img src={hero} alt="Natural close-up skin portrait" width={1600} height={1024} className="absolute inset-0 size-full object-cover object-right" />
      <div className="absolute inset-0 bg-background/15 dark:bg-background/70" />
      <div className="relative mx-auto flex min-h-[575px] max-w-7xl items-center px-5 py-14 sm:px-8 md:min-h-[630px]">
        <div className="max-w-[550px]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/75 px-3.5 py-1.5 text-xs font-medium text-primary"><Sparkles className="size-3.5" /> YOUR SKIN. A LITTLE BETTER UNDERSTOOD.</div>
          <h1 className="text-[64px] leading-[1.02] sm:text-[84px]">SkinTwin AI<span className="mt-3 block text-[48px] italic text-primary sm:text-[64px]">Your skin, over time.</span></h1>
          <p className="mt-6 max-w-sm text-base leading-7 text-muted-foreground">Meet your digital skin twin. One photo, meaningful insights, and a clearer picture of what your skin needs — week by week.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3"><Button asChild size="lg" className="h-12 rounded-full px-6"><Link to="/register">Meet your skin twin <ArrowUpRight /></Link></Button><Button asChild variant="outline" size="lg" className="h-12 rounded-full bg-background/70 px-5"><Link to="/demo">Explore a sample <ArrowRight /></Link></Button></div>
          <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><Check className="size-3.5 text-primary" /> No guesswork</span><span className="flex items-center gap-1.5"><LockKeyhole className="size-3.5 text-primary" /> Private by design</span></div>
        </div>
        <div className="absolute bottom-9 right-7 hidden w-56 rounded-2xl border bg-card/95 p-4 shadow-lg lg:block">
          <div className="mb-3 flex justify-between text-xs"><span className="font-medium">Your skin snapshot</span><span className="text-muted-foreground">SAMPLE</span></div>
          <div className="flex items-center gap-4"><ScoreRing score={78} size={92} /><div><span className="font-display text-xl">Looking balanced</span><div className="mt-2"><Delta value={6} suffix=" this month" /></div></div></div>
          <div className="mt-4 border-t pt-3 text-xs text-muted-foreground">Small habits. Visible progress.</div>
        </div>
      </div>
    </section>
    <div className="border-y bg-card"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-5 text-xs sm:px-8"><span className="font-medium text-muted-foreground">A MORE PERSONAL APPROACH TO SKINCARE</span><span className="flex items-center gap-2"><Camera className="size-4 text-primary" /> Photo-based insights</span><span className="flex items-center gap-2"><ChartNoAxesCombined className="size-4 text-rose" /> Week-by-week progress</span><span className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> Your photos stay private</span></div></div>
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="mb-3 text-xs font-medium text-rose">THE SMALL CHECK-IN THAT MAKES A DIFFERENCE</p><h2 className="text-4xl sm:text-5xl">A simple rhythm. A clearer picture.</h2></div><p className="max-w-xs text-sm leading-6 text-muted-foreground">Get to know your skin beyond the mirror, without adding more to your day.</p></div>
      <div className="mt-10 grid gap-8 md:grid-cols-3">{[
        [Camera, "01", "Take a moment. Take a photo.", "A close-up in natural light is all it takes. Choose a photo or use your camera."],
        [Sparkles, "02", "Meet your skin's story.", "YouCam Skin AI turns your photo into cosmetic insights across skin concerns."],
        [ChartNoAxesCombined, "03", "Watch the little changes.", "Check in weekly and see how your skin looks over time, alongside your routine."],
      ].map(([Icon, no, title, text]) => { const I = Icon as typeof Camera; return <div key={String(no)} className="border-t pt-6"><div className="flex items-center justify-between"><div className="grid size-12 place-items-center rounded-full bg-secondary text-primary"><I className="size-5" /></div><span className="font-display text-3xl text-rose/60">{String(no)}</span></div><h3 className="mt-6 text-2xl">{String(title)}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{String(text)}</p></div>; })}</div>
    </section>
    <section className="border-y bg-secondary/40"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_1.15fr]"><div><p className="mb-3 text-xs font-medium text-rose">MORE THAN A SINGLE SCORE</p><h2 className="text-4xl sm:text-5xl">The details that make<br />your skin, <i>your skin.</i></h2><p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">Look at each concern individually. Find what deserves a little extra care and celebrate what is going well.</p><Button asChild variant="link" className="mt-4 px-0"><Link to="/guide">Understand your skin insights <ArrowRight /></Link></Button></div><div className="grid grid-cols-2 gap-x-7 gap-y-4 sm:grid-cols-3">{METRICS.map((m) => <div key={m.key} className="flex items-center gap-2 border-b py-3 text-sm"><span className="size-1.5 rounded-full bg-rose" />{m.label}</div>)}</div></div></section>
    <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 md:grid-cols-2"><div className="flex gap-5"><div className="grid size-14 shrink-0 place-items-center rounded-full bg-secondary"><ShieldCheck className="size-6 text-primary" /></div><div><h3 className="text-3xl">Your skin is personal.<br />Your data should be, too.</h3><p className="mt-4 text-sm leading-7 text-muted-foreground">Private photos. Short-lived access. Your own records, and nobody else's. You decide what to keep and what to delete.</p><Button asChild variant="link" className="mt-2 px-0"><Link to="/privacy">Our privacy promise <ArrowUpRight /></Link></Button></div></div><div className="flex gap-5"><div className="grid size-14 shrink-0 place-items-center rounded-full bg-secondary"><Heart className="size-6 text-rose" /></div><div><h3 className="text-3xl">Room for the people<br />you care about.</h3><p className="mt-4 text-sm leading-7 text-muted-foreground">Track up to three people on one account. Each person gets their own skin journey, photos, routine and progress.</p><Button asChild variant="link" className="mt-2 px-0"><Link to="/register">Start your first profile <ArrowUpRight /></Link></Button></div></div></section>
    <section className="mx-auto max-w-3xl px-5 pb-20"><p className="text-center text-xs font-medium text-rose">A FEW THINGS YOU MIGHT BE WONDERING</p><h2 className="mt-3 text-center text-4xl">Good questions. Clear answers.</h2><Accordion type="single" collapsible className="mt-8">{[
      ["Is SkinTwin a medical diagnosis?", "No. SkinTwin provides cosmetic estimates for personal tracking, not medical advice. Speak to a qualified professional about persistent or concerning skin changes."],
      ["Do I need to check in every day?", "No. A weekly photo in similar lighting and pose is usually a more consistent way to track visible changes."],
      ["Can I track someone else?", "Yes — up to three people per account. Get their consent before uploading a photo. Each person's records stay separate."],
      ["What happens to my photos?", "Photos are stored privately. Deleting a check-in queues its photo for permanent erasure. Read our photo retention page for the full details."],
    ].map(([q,a],i) => <AccordionItem value={String(i)} key={q}><AccordionTrigger className="text-left text-sm">{q}</AccordionTrigger><AccordionContent className="text-sm leading-6 text-muted-foreground">{a}</AccordionContent></AccordionItem>)}</Accordion></section>
    <section className="bg-primary text-primary-foreground"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-5 py-14 sm:px-8"><div><h2 className="text-4xl sm:text-5xl">A little care starts with a little insight.</h2><p className="mt-3 text-sm opacity-75">Your first check-in is the start of your story.</p></div><Button asChild variant="secondary" size="lg" className="h-12 rounded-full"><Link to="/register">Meet your skin twin <ArrowUpRight /></Link></Button></div></section>
  </PublicShell>;
}