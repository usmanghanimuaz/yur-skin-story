import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/app-shell";
import { Onboarding } from "@/components/app/onboarding";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/_authenticated/welcome")({ head: () => pageHead("Welcome", "Set up Your Skin Story in four short steps."), component: () => <AppShell><Onboarding /></AppShell> });
