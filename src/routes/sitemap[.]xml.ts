import { createFileRoute } from "@tanstack/react-router";

const BASE_URL = "https://yur-skin-story.lovable.app";
// Public, indexable pages only. Private account pages and password reset are excluded.
const PATHS = ["/", "/how-it-works", "/guide", "/demo", "/shared-scans", "/register", "/login", "/support", "/privacy", "/terms", "/consent", "/cookies", "/security", "/accessibility", "/your-data", "/medical-disclaimer", "/photo-retention"];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const urls = PATHS.map((p) => `<url><loc>${BASE_URL}${p}</loc></url>`).join("");
        return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
