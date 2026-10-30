import { createFileRoute } from "@tanstack/react-router";
import { PublicShell } from "@/components/app/public-shell";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/guide")({ head: () => pageHead("The SkinTwin guide", "How to set up your account, take a passing close-up photo and read your report."), component: Page });
function Page() { return <PublicShell><article className="mx-auto max-w-3xl px-5 py-16"><h1 className="text-5xl">The SkinTwin guide</h1><p className="mt-6 leading-8 text-muted-foreground">How to set up your account, take a passing close-up photo and read your report.</p><p className="mt-4 leading-8 text-muted-foreground">Use daylight, face the camera, remove filters and keep the face large in frame. Check in weekly in similar light. Track up to 3 people per account. Scores are cosmetic estimates only.</p></article></PublicShell>; }
