import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/app/policy";
import { pageHead } from "@/lib/seo";
import photo from "@/assets/how-photo.jpg";

export const Route = createFileRoute("/guide")({ head: () => pageHead("Your Skin Story photo guide", "How to set up your account, take a photo that passes analysis, and read your skin report."), component: Page });

function Page() {
  return <PolicyPage eyebrow="GUIDE" title="Your Skin Story photo guide" image={photo} intro="Consistent photos make consistent results. Follow these steps every week for a fair comparison over time." sections={[
    { title: "Set up your account", body: <><p>Create an account, confirm your email and complete the four-step onboarding: who you are tracking, skin type and concerns, safety details, and consent.</p><p>You can add up to three people. Each person needs to agree before you upload their photo.</p></> },
    { title: "Take a photo that passes", body: <ul><li>Use natural daylight facing a window; avoid harsh overhead light or flash.</li><li>Face the camera straight on, neutral expression, eyes open.</li><li>No filters, beauty mode, makeup or heavy skincare residue.</li><li>Pull hair back; remove glasses and hats.</li><li>Fill most of the frame with your face. JPG, PNG or WebP under 10 MB.</li></ul> },
    { title: "Keep it consistent", body: <p>Check in once a week, at a similar time of day, in the same spot and light. Small changes in lighting can move scores more than real skin changes.</p> },
    { title: "Reading your report", body: <><p>Your skin score summarises 11 cosmetic metrics on a 0–100 scale. 80+ reads as excellent, 65–79 good, 50–64 fair, below 50 a focus area.</p><p>Arrows show the change against your previous check-in. One week is noise; look for trends over a month.</p></> },
    { title: "If analysis fails", body: <p>Usually the face was too small, blurred or poorly lit. Your quota is returned and the rejected photo is queued for erasure. Retake following the steps above.</p> },
    { title: "Fair-use limits", body: <p>To keep analysis available for everyone: up to 3 scans per 10 minutes and 10 per day per account.</p> },
  ]} />;
}
