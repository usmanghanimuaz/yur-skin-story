import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/app-shell";
import { Dashboard } from "@/components/app/dashboard";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/demo")({ head: () => pageHead("Sample dashboard", "Explore an illustrative Your Skin Story progress dashboard."), component: () => <AppShell sample><Dashboard sample /></AppShell> });
