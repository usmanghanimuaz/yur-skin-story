import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/app/auth-page";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/register")({ head: () => pageHead("Create account", "Create account to SkinTwin AI."), component: () => <AuthPage mode="register" /> });
