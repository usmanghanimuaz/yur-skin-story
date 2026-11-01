import { createFileRoute } from "@tanstack/react-router";
import { TranslatedPolicy } from "@/components/app/translated-policy";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/terms")({ head: () => pageHead("Terms of use", "The rules for using SkinTwin AI, including acceptable use, limits and liability."), component: Page });

function Page() {
  return <TranslatedPolicy page="terms" />;
}
