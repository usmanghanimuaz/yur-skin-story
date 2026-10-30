import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/app/dashboard";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/_authenticated/export-data")({ head: () => pageHead("Export data", "Export data in SkinTwin AI"), component: () => <AppShell><EmptyState title="Export data" text="This part of the rebuilt app is next in the migration and is not finished yet." action="New check-in" /></AppShell> });
