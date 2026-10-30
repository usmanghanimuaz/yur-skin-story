import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/app-shell";
import { Dashboard } from "@/components/app/dashboard";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/_authenticated/dashboard")({ head: () => pageHead("Dashboard", "Your SkinTwin progress dashboard."), component: () => <AppShell><Dashboard /></AppShell> });
