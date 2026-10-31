import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/app/policy";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/photo-retention")({ head: () => pageHead("Photo retention", "How SkinTwin stores your face photos and how deletion erases the actual file."), component: Page });

function Page() {
  return <PolicyPage eyebrow="PHOTOS" title="Photo retention" intro="Your photos are kept only as long as you want them, and deleting means the file itself is erased — not just hidden." sections={[
    { title: "Where photos live", body: <p>In a private storage folder that belongs to your account. There are no public links; the app creates a viewing link that expires within one hour.</p> },
    { title: "Deleting a check-in or person", body: <p>The record is removed and its photo is queued for erasure. We erase the file straight away; if storage is briefly unavailable, an automatic job retries every hour until it succeeds.</p> },
    { title: "Rejected photos", body: <p>If analysis fails, the photo is not kept as a check-in and is queued for erasure the same way.</p> },
    { title: "Deleting your account", body: <p>Every photo in your folder is erased first, then all records, then your sign-in. If photo erasure fails, nothing else is deleted so you can safely retry.</p> },
    { title: "Copies at YouCam", body: <p>YouCam receives the photo only for the analysis you start and handles it under its own retention terms.</p> },
    { title: "Backups", body: <p>Encrypted infrastructure backups may hold deleted data for a short rolling period before being overwritten; they are not used to restore your account.</p> },
  ]} />;
}
