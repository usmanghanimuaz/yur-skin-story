import { createFileRoute, Link } from "@tanstack/react-router";
import { TranslatedPolicy } from "@/components/app/translated-policy";
import { pageHead } from "@/lib/seo";
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from "@/lib/site";
import still from "@/assets/privacy-still.jpg";

export const Route = createFileRoute("/privacy")({ head: () => pageHead("Privacy policy", "What SkinTwin collects, why, who processes it, how long it is kept and how you can delete it."), component: Page });

function Page() {
  return <TranslatedPolicy page="privacy" image={still} extras={{
    5: <p><Link to="/photo-retention" className="text-primary underline">Photo retention</Link></p>,
    6: <p><Link to="/your-data" className="text-primary underline">Your data rights</Link></p>,
    9: <p><a className="text-primary underline" href={SUPPORT_MAILTO}>{SUPPORT_EMAIL}</a></p>,
  }} />;
}
