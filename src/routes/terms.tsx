import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/app/policy";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/terms")({ head: () => pageHead("Terms of use", "The rules for using SkinTwin AI, including acceptable use, limits and liability."), component: Page });

function Page() {
  return <PolicyPage eyebrow="TERMS" title="Terms of use" intro="By creating an account you agree to these terms. Please read them with our privacy policy." sections={[
    { title: "The service", body: <p>SkinTwin is a cosmetic skin journal. It stores your photos, shows scores from YouCam Skin AI and offers general suggestions. Features may change as we improve the product.</p> },
    { title: "Your account", body: <p>You must be 16 or older, give accurate details and keep your password safe. You are responsible for activity on your account.</p> },
    { title: "Acceptable use", body: <ul><li>Upload only photos of yourself or people who have agreed.</li><li>No unlawful, explicit or harmful content.</li><li>No attempts to access other accounts, overload the service or bypass fair-use limits.</li></ul> },
    { title: "Products and prices", body: <p>Catalogue products are suggestions, not endorsements. Prices are only shown as verified when checked within the last 30 days; otherwise check with the retailer.</p> },
    { title: "No medical advice", body: <p>Results are cosmetic estimates and may be inaccurate. See the medical disclaimer.</p> },
    { title: "Liability", body: <p>The service is provided as-is. To the extent the law allows, we are not liable for decisions made based on scores or suggestions.</p> },
    { title: "Ending", body: <p>You can delete your account at any time. We may suspend accounts that break these terms.</p> },
  ]} />;
}
