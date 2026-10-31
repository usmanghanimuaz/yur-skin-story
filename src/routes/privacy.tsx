import { createFileRoute, Link } from "@tanstack/react-router";
import { PolicyPage } from "@/components/app/policy";
import { pageHead } from "@/lib/seo";
import still from "@/assets/privacy-still.jpg";

export const Route = createFileRoute("/privacy")({ head: () => pageHead("Privacy policy", "What SkinTwin collects, why, who processes it, how long it is kept and how you can delete it."), component: Page });

function Page() {
  return <PolicyPage eyebrow="PRIVACY" title="Your privacy" image={still} intro="Your skin is personal. We collect only what we need to run your skin journal, keep it private to your account, and let you take it with you or erase it at any time." sections={[
    { title: "What we collect", body: <ul><li>Account: email, display name, sign-in method and preferences (locale, theme, notification choices).</li><li>Person profiles: name, age range, skin type, concerns, sensitivities and safety details you choose to give.</li><li>Check-ins: face photos, scores returned by YouCam Skin AI, notes and dates.</li><li>Routine: products you log and when you start or stop them.</li><li>Security: sign-in and account activity events.</li></ul> },
    { title: "Why we use it", body: <p>Only to provide the service: analyse your photos, show your history and comparisons, give safety-aware suggestions and protect your account. We do not sell your data, use it for advertising or train our own models on your photos.</p> },
    { title: "Who processes it", body: <ul><li>Our cloud hosting provider stores your records and photos in private, access-controlled storage.</li><li>YouCam (Perfect Corp.) receives your photo only when you start an analysis, to return skin scores.</li></ul> },
    { title: "Who can see it", body: <p>Only you. Every record is tied to your account and checked on every request. Photos are viewed through links that expire within one hour. Administrators maintain the product catalogue but cannot browse your check-ins.</p> },
    { title: "How long we keep it", body: <p>Until you delete it. See <Link to="/photo-retention" className="text-primary underline">photo retention</Link> for exactly how photos are erased.</p> },
    { title: "Your choices", body: <p>Export, correct or delete your data from Settings at any time. Read <Link to="/your-data" className="text-primary underline">your data rights</Link>.</p> },
    { title: "Children", body: <p>SkinTwin is for adults. Do not upload a photo of anyone under 16, or anyone who has not agreed.</p> },
    { title: "Changes", body: <p>If we materially change this policy we will show a notice in the app before the change applies.</p> },
  ]} />;
}
