import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/app/auth-page";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/auth")({ head: () => pageHead("Sign in", "Sign in with Google or email to open your private Skin Twin AI dashboard."), component: () => <AuthPage mode="login" /> });
