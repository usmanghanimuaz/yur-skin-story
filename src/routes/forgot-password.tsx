import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/app/auth-page";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/forgot-password")({ head: () => pageHead("Forgot password", "Request a secure link by email to reset your Skin Twin AI password."), component: () => <AuthPage mode="forgot" /> });
