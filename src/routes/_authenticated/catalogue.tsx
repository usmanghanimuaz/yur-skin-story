import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/app-shell";
import { Catalogue } from "@/components/app/catalogue";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/_authenticated/catalogue")({ head: () => pageHead("Catalogue", "Explore skincare products by ingredient and country in Skin Twin AI."), component: () => <AppShell><Catalogue /></AppShell> });
