import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/app/auth-page";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/reset-password")({ head: () => { const h = pageHead("Reset password", "Choose a new password for your Skin Twin AI account."); return { meta: [...h.meta, { name: "robots", content: "noindex" }] }; }, component: () => <AuthPage mode="reset" /> });
