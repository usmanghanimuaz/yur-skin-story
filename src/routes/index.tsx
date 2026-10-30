import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/app/landing";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/")({ head: () => pageHead("Your skin, over time", "Track weekly skin check-ins with YouCam Skin AI and compare cosmetic progress privately."), component: Landing });
