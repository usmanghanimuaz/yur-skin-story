import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { PublicShell } from "./public-shell";

export type Section = { title: string; body: ReactNode };

export const POLICY_LINKS = [
  ["/privacy", "Privacy policy"],
  ["/photo-retention", "Photo retention"],
  ["/consent", "Consent"],
  ["/cookies", "Cookies"],
  ["/security", "Security"],
  ["/your-data", "Your data rights"],
  ["/terms", "Terms of use"],
  ["/medical-disclaimer", "Medical disclaimer"],
  ["/accessibility", "Accessibility"],
] as const;

export function PolicyPage({ eyebrow, title, intro, updated = "31 October 2026", sections, image }: { eyebrow: string; title: string; intro: string; updated?: string; sections: Section[]; image?: string }) {
  return <PublicShell>
    <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[220px_1fr]">
      <aside className="order-2 lg:order-1">
        <nav aria-label="Policies" className="sticky top-6 grid gap-1 text-sm">
          <p className="mb-2 text-xs font-medium text-rose">TRUST CENTRE</p>
          {POLICY_LINKS.map(([to, label]) => <Link key={to} to={to} className="rounded-md px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground" activeProps={{ className: "bg-secondary text-foreground font-medium" }}>{label}</Link>)}
          <Link to="/support" className="rounded-md px-3 py-2 text-muted-foreground hover:bg-secondary">Contact support</Link>
        </nav>
      </aside>
      <article className="order-1 max-w-3xl lg:order-2">
        <p className="text-xs font-medium tracking-widest text-rose">{eyebrow}</p>
        <h1 className="mt-3 text-5xl sm:text-6xl">{title}</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">{intro}</p>
        <p className="mt-3 text-xs text-muted-foreground">Last updated {updated}</p>
        {image && <img src={image} alt="" width={1200} height={912} loading="lazy" className="mt-8 aspect-[16/9] w-full rounded-3xl object-cover" />}
        <div className="mt-10 divide-y border-y">
          {sections.map((s, i) => <section key={s.title} className="py-7">
            <h2 className="text-2xl"><span className="mr-3 font-display text-rose/70">{String(i + 1).padStart(2, "0")}</span>{s.title}</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground [&_li]:ml-5 [&_li]:list-disc">{s.body}</div>
          </section>)}
        </div>
        <p className="mt-8 text-sm text-muted-foreground">Questions? <Link to="/support" className="text-primary underline">Contact support</Link>.</p>
      </article>
    </div>
  </PublicShell>;
}
