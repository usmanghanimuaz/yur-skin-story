import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { METRICS, type Metrics, delta } from "@/lib/skin";
import { demoPhoto } from "@/lib/demo";

export function ScoreRing({ score, size = 156 }: { score: number; size?: number }) {
  const r = 44, c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-label={`Overall score ${score} out of 100`}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--secondary)" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--primary)" strokeLinecap="round" strokeWidth="8" strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center"><div><div className="font-display text-5xl leading-none">{score}</div><div className="text-xs text-muted-foreground">of 100</div></div></div>
    </div>
  );
}

export function Delta({ value, suffix = "" }: { value: number | null; suffix?: string }) {
  if (value === null) return <span className="text-xs text-muted-foreground">First result</span>;
  const Icon = value > 0 ? ArrowUp : value < 0 ? ArrowDown : Minus;
  return <span className={`inline-flex items-center gap-1 text-xs font-medium ${value > 0 ? "text-success" : value < 0 ? "text-rose" : "text-muted-foreground"}`}><Icon className="size-3" />{value > 0 ? "+" : ""}{value}{suffix}</span>;
}

export function MetricGrid({ metrics, previous }: { metrics: Metrics; previous?: Metrics }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {METRICS.map((m) => {
        const v = metrics[m.key];
        return (
          <div key={m.key} className="rounded-2xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2"><span className="text-sm text-muted-foreground">{m.label}</span>{previous && <Delta value={delta(v, previous[m.key])} />}</div>
            <div className="mt-2 font-display text-3xl">{typeof v === "number" ? v : "—"}</div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${v ?? 0}%` }} /></div>
          </div>
        );
      })}
    </div>
  );
}

export function CheckInPhoto({ path, sample, className = "" }: { path: string | null; sample?: boolean; className?: string }) {
  const [url, setUrl] = useState<string | null>(sample ? demoPhoto : null);
  useEffect(() => {
    if (!path || sample) return;
    supabase.storage.from("checkin-photos").createSignedUrl(path, 3600).then(({ data }) => setUrl(data?.signedUrl ?? null));
  }, [path, sample]);
  return url ? <img src={url} alt="Check-in close-up" className={`object-cover ${className}`} /> : <div className={`grid place-items-center bg-secondary text-sm text-muted-foreground ${className}`}>Photo unavailable</div>;
}