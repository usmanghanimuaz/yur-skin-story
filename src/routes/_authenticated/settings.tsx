import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/app-shell";
import { Workspace } from "@/components/app/workspace";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/_authenticated/settings")({ head: () => pageHead("Settings", "Settings in SkinTwin AI"), component: () => <AppShell><Workspace view="settings" /></AppShell> });
