import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/app/policy";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/cookies")({ head: () => pageHead("Cookies & local storage", "Skin Twin AI uses only essential browser storage to keep you signed in and remember preferences."), component: Page });

function Page() {
  return <PolicyPage eyebrow="COOKIES" title="Cookies & local storage" intro="We use only what is essential. No advertising cookies, no cross-site tracking." sections={[
    { title: "Essential storage", body: <ul><li>Sign-in session — keeps you logged in securely.</li><li>Preferences — language, theme and the person you last selected.</li><li>Onboarding progress — so you can resume where you left off.</li></ul> },
    { title: "No tracking", body: <p>We do not use advertising or third-party analytics cookies.</p> },
    { title: "Your control", body: <p>Clearing your browser storage signs you out and resets preferences. It does not delete your account data — use Settings for that.</p> },
  ]} />;
}
