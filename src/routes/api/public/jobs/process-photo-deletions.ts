import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

export const Route = createFileRoute("/api/public/jobs/process-photo-deletions")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { processDeletionQueue } = await import("@/lib/erasure.server");
        const result = await processDeletionQueue(supabaseAdmin);
        return Response.json({ success: true, ...result });
      },
    },
  },
});
