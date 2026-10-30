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

## SkinTwin architecture
- Keep public content at top-level TanStack routes and private account surfaces under the managed `_authenticated` boundary, because browser sessions are not available during SSR.
- Use Cloud RLS for owner reads and ordinary edits; score-bearing analysis and photo erasure use authenticated server functions, because browser writes must not forge provider results.
- Keep illustrative sample data browser-only and explicitly labelled, because sample scores must never become saved real check-ins.
- Keep skin metric, safety advice and product impact rules in browser-safe pure modules, because they need focused regression tests and consistent presentation.
- Keep migration capability state in the migration ledger, because source records and credentials can arrive separately from the rebuild.
