import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/app/public-shell";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/consent")({ head: () => pageHead("Consent to guidance", "Consent terms for SkinTwin cosmetic guidance, version 1."), component: Page });
function Page() { return <PublicShell><article className="mx-auto max-w-3xl px-5 py-16"><h1 className="text-5xl">Consent to guidance</h1><p className="mt-6 leading-8 text-muted-foreground">Consent terms for SkinTwin cosmetic guidance, version 1.</p><p className="mt-4 leading-8 text-muted-foreground">By using guidance you understand it is general and cosmetic. Tell us about pregnancy and allergies so unsafe suggestions are filtered, and patch test new products.</p></article></PublicShell>; }
