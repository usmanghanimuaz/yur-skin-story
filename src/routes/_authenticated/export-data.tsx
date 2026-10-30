import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/app-shell";
import { Workspace } from "@/components/app/workspace";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/_authenticated/export-data")({ head: () => pageHead("Export data", "Export data in SkinTwin AI"), component: () => <AppShell><Workspace view="export-data" /></AppShell> });
