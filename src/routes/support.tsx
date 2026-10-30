import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/app/public-shell";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/support")({ head: () => pageHead("Support", "Where to get help with SkinTwin AI."), component: Page });
function Page() { return <PublicShell><article className="mx-auto max-w-3xl px-5 py-16"><h1 className="text-5xl">Support</h1><p className="mt-6 leading-8 text-muted-foreground">Where to get help with SkinTwin AI.</p><p className="mt-4 leading-8 text-muted-foreground">Start with the guide for photo and account problems. If a photo is rejected, retake a closer, well-lit picture without filters.</p></article></PublicShell>; }
