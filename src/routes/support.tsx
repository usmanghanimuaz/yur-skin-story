import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/app/public-shell";
import { pageHead } from "@/lib/seo";
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from "@/lib/site";
import { useContent } from "@/lib/content";
export const Route = createFileRoute("/support")({ head: () => pageHead("Support", "Where to get help with Skin Twin AI."), component: Page });
function Page() {
  const { c } = useContent();
  return <PublicShell><article className="mx-auto max-w-3xl px-5 py-16"><h1 className="text-5xl">{c("support", "title")}</h1><p className="mt-6 leading-8 text-muted-foreground">{c("support", "intro")}</p><p className="mt-4 leading-8 text-muted-foreground">{c("support", "p1")}</p><p className="mt-4 leading-8 text-muted-foreground">{c("support", "p2")} <Link to="/support-desk" className="font-medium text-primary underline">{c("support", "p2_link")}</Link></p><p className="mt-4 leading-8 text-muted-foreground">{c("support", "p3")} <a className="font-medium text-primary underline" href={SUPPORT_MAILTO}>{SUPPORT_EMAIL}</a></p></article></PublicShell>;
}
