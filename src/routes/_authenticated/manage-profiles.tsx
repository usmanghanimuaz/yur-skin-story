import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/app-shell";
import { Workspace } from "@/components/app/workspace";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/_authenticated/manage-profiles")({ head: () => pageHead("Manage people", "Manage people in Skin Twin AI"), component: () => <AppShell><Workspace view="people" /></AppShell> });
