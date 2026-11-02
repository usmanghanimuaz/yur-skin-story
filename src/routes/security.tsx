import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/app/policy";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/security")({ head: () => pageHead("Security", "How Skin Twin AI protects your account, photos and skin records."), component: Page });

function Page() {
  return <PolicyPage eyebrow="SECURITY" title="How we protect you" intro="Security is built into every layer, from sign-in to storage to deletion." sections={[
    { title: "Account protection", body: <ul><li>Email verification and secure password reset.</li><li>Google sign-in available.</li><li>An account activity log so you can spot anything unusual.</li></ul> },
    { title: "Data isolation", body: <p>Database rules make every record readable only by its owner. Admin rights are stored separately and checked on the server, never from editable profile data.</p> },
    { title: "Trusted results", body: <p>Scores are written only by our server after a genuine YouCam response. The browser cannot create or edit a scan result.</p> },
    { title: "Secrets stay on the server", body: <p>API keys are never sent to your browser. All traffic is encrypted in transit.</p> },
    { title: "Reporting a problem", body: <p>Found a vulnerability? Please report it through Support and we will respond promptly.</p> },
  ]} />;
}
