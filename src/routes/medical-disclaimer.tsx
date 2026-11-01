import { createFileRoute } from "@tanstack/react-router";
import { TranslatedPolicy } from "@/components/app/translated-policy";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/medical-disclaimer")({ head: () => pageHead("Medical disclaimer", "Your Skin Story provides cosmetic estimates for personal tracking, not medical diagnosis or treatment."), component: Page });

function Page() {
  return <TranslatedPolicy page="medical-disclaimer" />;
}
