import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/app/auth-page";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/forgot-password")({ head: () => pageHead("Forgot password", "Forgot password to SkinTwin AI."), component: () => <AuthPage mode="forgot" /> });
