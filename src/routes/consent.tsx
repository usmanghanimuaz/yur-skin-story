import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/app/policy";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/consent")({ head: () => pageHead("Consent", "What you agree to when you upload a face photo to SkinTwin, and how to withdraw."), component: Page });

function Page() {
  return <PolicyPage eyebrow="CONSENT" title="Photo & analysis consent" intro="Face photos are sensitive. Before your first check-in we ask for your clear, separate consent." sections={[
    { title: "What you agree to", body: <ul><li>We store your face photo privately in your account.</li><li>We send it to YouCam Skin AI to produce cosmetic scores.</li><li>We save the scores so you can track change over time.</li></ul> },
    { title: "Tracking other people", body: <p>You may add up to two other people. You confirm they are adults who have agreed — or, for someone you care for, that you have the right to consent for them.</p> },
    { title: "Withdrawing", body: <p>You can withdraw at any time by deleting check-ins, a person, or your whole account. Withdrawal stops future analysis and erases stored photos.</p> },
    { title: "Not medical", body: <p>Consent covers cosmetic tracking only. SkinTwin does not diagnose or treat any condition.</p> },
  ]} />;
}
