import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/app-shell";
import { Workspace } from "@/components/app/workspace";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/_authenticated/check-in/$id")({ head: () => pageHead("Check-in details", "Check-in details in Your Skin Story"), component: Page });
function Page(){ const { id } = Route.useParams(); return <AppShell><Workspace view="detail" id={id}/></AppShell>; }
