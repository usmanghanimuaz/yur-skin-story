import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/app/public-shell";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/privacy")({ head: () => pageHead("Your privacy", "What SkinTwin stores, why, how long, and how to delete it."), component: Page });
function Page() { return <PublicShell><article className="mx-auto max-w-3xl px-5 py-16"><h1 className="text-5xl">Your privacy</h1><p className="mt-6 leading-8 text-muted-foreground">What SkinTwin stores, why, how long, and how to delete it.</p><p className="mt-4 leading-8 text-muted-foreground">We store your account, person profiles, check-in scores, notes, products and private photos. Only you can read your records. Photos are viewed through links that expire within one hour, and deleting a check-in queues its photo for erasure.</p></article></PublicShell>; }
