import { createFileRoute } from "@tanstack/react-router";
import { TranslatedPolicy } from "@/components/app/translated-policy";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/photo-retention")({ head: () => pageHead("Photo retention", "How SkinTwin stores your face photos and how deletion erases the actual file."), component: Page });

function Page() {
  return <TranslatedPolicy page="photo-retention" />;
}
