import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/app/app-shell";
import { AdminPanel } from "@/components/app/catalogue";
import { EmptyState } from "@/components/app/dashboard";
import { myRole } from "@/lib/skintwin.functions";
import { pageHead } from "@/lib/seo";

function AdminGate() {
  const fn = useServerFn(myRole);
  const { data, isLoading } = useQuery({ queryKey: ["role"], queryFn: () => fn() });
  if (isLoading) return <p className="text-sm text-muted-foreground">Checking access…</p>;
  return data?.admin ? <AdminPanel /> : <EmptyState title="Admins only" text="This area is for catalogue and evidence maintenance." />;
}
export const Route = createFileRoute("/_authenticated/admin")({ head: () => pageHead("Admin", "SkinTwin AI catalogue and evidence maintenance."), component: () => <AppShell><AdminGate /></AppShell> });
