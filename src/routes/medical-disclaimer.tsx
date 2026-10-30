import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/app/public-shell";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/medical-disclaimer")({ head: () => pageHead("Medical disclaimer", "SkinTwin AI estimates are cosmetic and are not a diagnosis."), component: Page });
function Page() { return <PublicShell><article className="mx-auto max-w-3xl px-5 py-16"><h1 className="text-5xl">Medical disclaimer</h1><p className="mt-6 leading-8 text-muted-foreground">SkinTwin AI estimates are cosmetic and are not a diagnosis.</p><p className="mt-4 leading-8 text-muted-foreground">SkinTwin is not a medical device. It does not diagnose, treat or prevent any condition. Consult a qualified professional about any skin concern.</p></article></PublicShell>; }
