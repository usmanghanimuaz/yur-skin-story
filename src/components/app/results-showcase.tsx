import { ScoreRing } from "./score";
import amelia from "@/assets/result-amelia.jpg.asset.json";
import kenji from "@/assets/result-kenji.jpg.asset.json";
import omar from "@/assets/result-omar.jpg.asset.json";

const RESULTS = [
  { img: amelia.url, score: 75, label: "Good", note: "Baseline check-in", metrics: [["Hydration", 70], ["Oil control", 68], ["Clarity", 72]] },
  { img: omar.url, score: 73, label: "Good", note: "Baseline check-in", metrics: [["Hydration", 69], ["Oil control", 78], ["Clarity", 70]] },
  { img: kenji.url, score: 76, label: "Good", note: "+1 vs previous check-in", metrics: [["Hydration", 73], ["Oil control", 66], ["Clarity", 81]] },
] as const;

export function ResultsShowcase() {
  return <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div><p className="mb-3 text-xs font-medium text-rose">REAL CHECK-INS FROM OUR ORIGINAL APP</p><h2 className="text-4xl sm:text-5xl">What a check-in looks like.</h2></div>
      <p className="max-w-sm text-sm leading-6 text-muted-foreground">Results from the original SkinTwin app, analysed by YouCam Skin AI and shared with permission. Cosmetic estimates only — not a diagnosis.</p>
    </div>
    <div className="mt-10 grid gap-6 md:grid-cols-3">
      {RESULTS.map((r) => <figure key={r.img} className="overflow-hidden rounded-3xl border bg-card">
        <img src={r.img} alt="Face close-up used for a SkinTwin check-in" width={560} height={700} loading="lazy" className="aspect-[4/5] w-full object-cover" />
        <figcaption className="p-5">
          <div className="flex items-center gap-4"><ScoreRing score={r.score} size={84} /><div><p className="font-display text-xl">{r.label}</p><p className="text-xs text-muted-foreground">{r.note}</p><span className="mt-2 inline-block rounded-full bg-secondary px-2.5 py-1 text-[10px] tracking-widest text-muted-foreground">YOUCAM SKIN AI</span></div></div>
          <dl className="mt-4 divide-y border-t text-sm">{r.metrics.map(([k, v]) => <div key={k} className="flex justify-between py-2"><dt className="text-muted-foreground">{k}</dt><dd className="font-display text-lg">{v}</dd></div>)}</dl>
        </figcaption>
      </figure>)}
    </div>
  </section>;
}
