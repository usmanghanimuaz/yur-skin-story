import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/app/auth-page";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/login")({ head: () => pageHead("Log in", "Log in to Your Skin Story."), component: () => <AuthPage mode="login" /> });
