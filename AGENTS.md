<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Your Skin Story architecture
- Keep public content at top-level TanStack routes and private account surfaces under the managed `_authenticated` boundary, because browser sessions are not available during SSR.
- Use Cloud RLS for owner reads and ordinary edits; score-bearing analysis and photo erasure use authenticated server functions, because browser writes must not forge provider results.
- Keep illustrative sample data browser-only and explicitly labelled, because sample scores must never become saved real check-ins.
- Keep skin metric, safety advice and product impact rules in browser-safe pure modules, because they need focused regression tests and consistent presentation.
- Keep migration capability state in the migration ledger, because source records and credentials can arrive separately from the rebuild.
- Admin access uses `user_roles` + `has_role` in RLS and server checks, because roles must never come from editable profile data.
- Photo-byte erasure lives in `src/lib/erasure.server.ts`, shared by user actions and the scheduled retry route, so both paths stay idempotent.
- UI locale strings live in `src/lib/i18n.tsx`; `ur` sets RTL on the document, because Urdu script must render right-to-left.
- Page sentences live once in `src/lib/content-defaults.ts` and are merged with maintainer edits by the provider in `src/lib/content.tsx`, because pages must still render built-in wording when nothing is edited and never carry a second copy of the text.
- Reminder eligibility rules live in `src/lib/reminders.ts` and one shared pass in `src/lib/reminders.server.ts` serves both the admin button and the scheduled job, because a reminder must be recorded once per period no matter who triggers it.
- Server functions validate input with `.validator(...)` (not the older `.inputValidator(...)`), because the pinned TanStack Start release renamed that builder method.

