import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicShell } from "@/components/app/public-shell";
import { SharedScanCard, sharedScansOptions } from "@/components/app/shared-scans";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/shared-scans")({
  head: () => pageHead("Shared skin scans", "See the latest skin check-ins that SkinTwin members chose to share publicly."),
  component: SharedScansPage,
});

function SharedScansPage() {
  const { data = [], isLoading } = useQuery(sharedScansOptions());
  return <PublicShell>
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
      <h1 className="text-5xl">Shared skin scans</h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">Every member here chose to share their latest scan, and can stop sharing at any time. Cosmetic scores only, not a diagnosis.</p>
      {isLoading ? <p className="mt-10 text-sm text-muted-foreground">Loading…</p> : !data.length ? <p className="mt-10 text-sm text-muted-foreground">No one has shared a scan yet.</p> :
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.map((s) => <SharedScanCard key={s.id} s={s} />)}</div>}
    </section>
  </PublicShell>;
}
