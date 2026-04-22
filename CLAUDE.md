# Won't You Be My Neighbor

## Supabase

- Project: `misc` (shared — hosts tables for multiple apps, `neighbors_*` prefix is ours)
- Project ID: `ytgmclahatuvolxisxry`
- URL: https://ytgmclahatuvolxisxry.supabase.co

Migrations live in `supabase/migrations/`. Apply via the Supabase MCP (`apply_migration`) against the project ID above. Match the existing naming convention — `neighbors_<action>` — so our migrations sort with other apps' on the shared project.

Regenerate types after schema changes via `mcp__supabase__generate_typescript_types` and write the `types` field into `src/utils/supabase/types.ts`.
