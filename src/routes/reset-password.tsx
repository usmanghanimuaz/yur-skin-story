import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/app/auth-page";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/reset-password")({ head: () => pageHead("Reset password", "Reset password to Your Skin Story."), component: () => <AuthPage mode="reset" /> });
