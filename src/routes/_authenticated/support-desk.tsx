import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/app-shell";
import { SupportDesk } from "@/components/app/support-desk";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/support-desk")({
  head: () => pageHead("Support desk", "Message the SkinTwin AI team and read their replies."),
  component: () => <AppShell><SupportDesk /></AppShell>,
});
