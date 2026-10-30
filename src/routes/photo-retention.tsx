import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/app/public-shell";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/photo-retention")({ head: () => pageHead("Photo retention", "How SkinTwin stores check-in photos and erases them after deletion."), component: Page });
function Page() { return <PublicShell><article className="mx-auto max-w-3xl px-5 py-16"><h1 className="text-5xl">Photo retention</h1><p className="mt-6 leading-8 text-muted-foreground">How SkinTwin stores check-in photos and erases them after deletion.</p><p className="mt-4 leading-8 text-muted-foreground">Photos are private and kept while their check-in exists. Deleting a check-in or person queues photos for erasure; bytes are removed once no record references them.</p></article></PublicShell>; }
