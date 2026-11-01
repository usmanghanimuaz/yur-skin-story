import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/app-shell";
import { Workspace } from "@/components/app/workspace";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/_authenticated/products")({ head: () => pageHead("My routine", "My routine in Your Skin Story"), component: () => <AppShell><Workspace view="products" /></AppShell> });
