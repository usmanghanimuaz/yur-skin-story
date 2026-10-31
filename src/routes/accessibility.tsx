import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/app/policy";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/accessibility")({ head: () => pageHead("Accessibility", "SkinTwin's commitment to an accessible experience for everyone."), component: Page });

function Page() {
  return <PolicyPage eyebrow="ACCESSIBILITY" title="Built for everyone" intro="We aim to meet WCAG 2.2 AA so everyone can track their skin comfortably." sections={[
    { title: "What we do", body: <ul><li>Keyboard navigation and visible focus throughout.</li><li>Screen-reader labels for scores, charts and buttons.</li><li>Light and dark themes with readable contrast.</li><li>Nine languages, with right-to-left layout for Urdu.</li><li>Layouts that work from small phones to desktops.</li></ul> },
    { title: "Known limits", body: <p>Photo-based analysis requires a camera image. If this is a barrier, contact us and we will help.</p> },
    { title: "Feedback", body: <p>Tell us about any difficulty through Support.</p> },
  ]} />;
}
