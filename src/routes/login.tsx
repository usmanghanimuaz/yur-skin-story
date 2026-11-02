import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/app/auth-page";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/login")({ head: () => pageHead("Log in", "Log in to Skin Twin AI to add a check-in and review your skin history."), component: () => <AuthPage mode="login" /> });
