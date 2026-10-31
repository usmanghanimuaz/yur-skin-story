import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage } from "@/components/app/policy";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/your-data")({ head: () => pageHead("Your data rights", "Access, export, correct and erase your SkinTwin data at any time."), component: Page });

function Page() {
  return <PolicyPage eyebrow="YOUR RIGHTS" title="Your data, your control" intro="You can see, take and erase everything we hold about you — directly in the app, no request form needed." sections={[
    { title: "Access & export", body: <p>Settings → Export data gives you a PDF report and a machine-readable file of your profiles, check-ins, products and activity.</p> },
    { title: "Correct", body: <p>Edit profiles, notes and products at any time.</p> },
    { title: "Erase", body: <p>Delete a single check-in, a whole person, or your account. Photo files are erased, not just hidden.</p> },
    { title: "Object & withdraw consent", body: <p>Stop using analysis at any time; deleting data withdraws consent for it.</p> },
    { title: "Complaints", body: <p>Contact Support first. You may also complain to your local data protection authority.</p> },
  ]} />;
}
