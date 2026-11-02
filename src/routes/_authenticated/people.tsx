import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/app-shell";
import { Workspace } from "@/components/app/workspace";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/_authenticated/people")({ head: () => pageHead("People", "People in Skin Twin AI"), component: () => <AppShell><Workspace view="people" /></AppShell> });
