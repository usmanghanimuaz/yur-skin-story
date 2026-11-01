import { createFileRoute } from "@tanstack/react-router";
import { TranslatedPolicy } from "@/components/app/translated-policy";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/consent")({ head: () => pageHead("Consent", "What you agree to when you upload a face photo to Your Skin Story, and how to withdraw."), component: Page });

function Page() {
  return <TranslatedPolicy page="consent" />;
}
