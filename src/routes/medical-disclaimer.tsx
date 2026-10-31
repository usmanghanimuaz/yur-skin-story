import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/app/policy";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/medical-disclaimer")({ head: () => pageHead("Medical disclaimer", "SkinTwin provides cosmetic estimates for personal tracking, not medical diagnosis or treatment."), component: Page });

function Page() {
  return <PolicyPage eyebrow="IMPORTANT" title="Cosmetic, not medical" intro="SkinTwin helps you notice visible changes. It is not a medical device and does not diagnose, treat or prevent any condition." sections={[
    { title: "What scores mean", body: <p>Scores are AI estimates from a single photo. Lighting, camera and angle affect them. Treat them as a personal trend, not a clinical measurement.</p> },
    { title: "When to see a professional", body: <ul><li>A mole or spot that changes shape, colour or size, bleeds or itches.</li><li>Painful, spreading or persistent rashes, acne or swelling.</li><li>Any skin change that worries you.</li></ul> },
    { title: "Suggestions and products", body: <p>Advice is general and rule-based. Patch-test new products; stop if irritation occurs. Ask a doctor or pharmacist before using actives during pregnancy or with medication.</p> },
    { title: "Emergencies", body: <p>For a sudden severe reaction, contact local emergency services immediately.</p> },
  ]} />;
}
