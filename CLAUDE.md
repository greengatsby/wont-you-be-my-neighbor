# Won't You Be My Neighbor

## Supabase

- Project: `misc` (shared — hosts tables for multiple apps, `neighbors_*` prefix is ours)
- Project ID: `ytgmclahatuvolxisxry`
- URL: https://ytgmclahatuvolxisxry.supabase.co

Migrations live in `supabase/migrations/`. Apply via the Supabase MCP (`apply_migration`) against the project ID above. File naming: use Supabase's timestamp format (`YYYYMMDDhhmmss_neighbors_<action>.sql`) — the prod DB uses this format and filename lexicographic sort must match apply order. Prefix with `neighbors_` so migrations sort with other apps' on the shared project.

`001_initial_schema.sql` predates the timestamp convention; leave it as-is. New migrations use the timestamp form.

Regenerate types after schema changes via `mcp__supabase__generate_typescript_types` and write the `types` field into `src/utils/supabase/types.ts`.
