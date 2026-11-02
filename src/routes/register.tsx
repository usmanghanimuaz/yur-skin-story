import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/app/auth-page";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/register")({ head: () => pageHead("Create account", "Create a free Skin Twin AI account to save weekly skin check-ins and follow your progress."), component: () => <AuthPage mode="register" /> });
