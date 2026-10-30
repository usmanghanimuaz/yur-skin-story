import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/app/public-shell";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/terms")({ head: () => pageHead("Terms of use", "The terms for using SkinTwin AI for personal cosmetic skin tracking."), component: Page });
function Page() { return <PublicShell><article className="mx-auto max-w-3xl px-5 py-16"><h1 className="text-5xl">Terms of use</h1><p className="mt-6 leading-8 text-muted-foreground">The terms for using SkinTwin AI for personal cosmetic skin tracking.</p><p className="mt-4 leading-8 text-muted-foreground">Use SkinTwin for personal, lawful tracking. Only upload photos of people who consent. Results are cosmetic estimates and not medical advice.</p></article></PublicShell>; }
