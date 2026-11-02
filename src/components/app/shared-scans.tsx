import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { listSharedScans, type SharedScan } from "@/lib/community.functions";
import { SLIDE_MS, nextSlide } from "@/lib/community";
import { METRICS } from "@/lib/skin";
import { Button } from "@/components/ui/button";

export const sharedScansOptions = (limit?: number) => ({
  queryKey: ["shared-scans", limit ?? "all"],
  queryFn: () => listSharedScans({ data: { limit } }),
  staleTime: 5 * 60_000,
});

export function SharedScanCard({ s }: { s: SharedScan }) {
  const top = METRICS.filter((m) => typeof s.metrics[m.key] === "number").slice(0, 4);
  return <article className="overflow-hidden rounded-3xl border bg-card">
    <img src={s.photoUrl} alt={`${s.name}'s skin check-in`} className="aspect-[4/5] w-full object-cover" loading="lazy" />
    <div className="space-y-3 p-5">
      <div className="flex items-baseline justify-between gap-3"><h3 className="text-2xl">{s.name}</h3><span className="font-display text-3xl text-primary">{s.score}<span className="text-xs text-muted-foreground">/100</span></span></div>
      <p className="text-xs text-muted-foreground">{new Date(s.date).toLocaleDateString()}</p>
      <ul className="grid grid-cols-2 gap-2 text-xs">{top.map((m) => <li key={m.key} className="rounded-xl bg-secondary px-3 py-2"><span className="text-muted-foreground">{m.label}</span> <b>{s.metrics[m.key]}</b></li>)}</ul>
    </div>
  </article>;
}

export function SharedScansSlider() {
  const { data = [] } = useQuery(sharedScansOptions(12));
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || data.length < 2) return;
    const t = setInterval(() => setI((v) => nextSlide(v, data.length)), SLIDE_MS);
    return () => clearInterval(t);
  }, [paused, data.length]);
  if (!data.length) return null;
  const idx = i % data.length;
  return <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8" aria-roledescription="carousel" aria-label="Shared scans">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-medium text-rose"><Users className="mr-1 inline size-3" />Shared by members</p><h2 className="mt-3 text-4xl">Real skin twins</h2><p className="mt-2 max-w-lg text-sm text-muted-foreground">These members chose to share their latest scan. Cosmetic scores only, not a diagnosis.</p></div>
      <Button asChild variant="outline" className="rounded-full"><Link to="/shared-scans">See all</Link></Button>
    </div>
    <div className="relative mx-auto max-w-sm" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="overflow-hidden rounded-3xl">
        <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${idx * 100}%)` }}>
          {data.map((s, n) => <div key={s.id} className="w-full shrink-0" aria-hidden={n !== idx}><SharedScanCard s={s} /></div>)}
        </div>
      </div>
      {data.length > 1 && <div className="mt-4 flex items-center justify-center gap-3">
        <Button size="icon" variant="ghost" aria-label="Previous" onClick={() => setI((idx - 1 + data.length) % data.length)}><ChevronLeft /></Button>
        {data.map((s, n) => <button key={s.id} aria-label={`Show ${s.name}`} onClick={() => setI(n)} className={`h-2 rounded-full transition-all ${n === idx ? "w-6 bg-primary" : "w-2 bg-secondary"}`} />)}
        <Button size="icon" variant="ghost" aria-label="Next" onClick={() => setI(nextSlide(idx, data.length))}><ChevronRight /></Button>
      </div>}
    </div>
  </section>;
}
