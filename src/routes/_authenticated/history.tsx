import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/app-shell";
import { Workspace } from "@/components/app/workspace";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/_authenticated/history")({ head: () => pageHead("My check-ins", "My check-ins in Skin Twin AI"), component: () => <AppShell><Workspace view="history" /></AppShell> });
