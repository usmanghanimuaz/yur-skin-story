import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/app/landing";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/")({ head: () => pageHead("Weekly skin check-ins, tracked privately", "Take a weekly face photo, get a YouCam Skin AI analysis, and compare your cosmetic skin progress privately over time."), component: Landing });
