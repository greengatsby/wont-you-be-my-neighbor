-- ============================================
-- neighbors_pipeline_logs
-- Generic observability table: one row per pipeline run.
-- Writes are service-role only; reads are admin-only.
-- ============================================

create table neighbors_pipeline_logs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null default gen_random_uuid(),

  pipeline text not null,
  entity_id uuid,
  entity_type text,

  user_id uuid references auth.users(id) on delete set null,

  route text,
  method text,

  status text not null default 'started'
    check (status in ('started','running','completed','failed')),
  level text not null default 'info'
    check (level in ('debug','info','warn','error')),
  current_step text,

  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_ms integer,
  step_timings jsonb not null default '{}'::jsonb,

  input_context jsonb not null default '{}'::jsonb,
  output_context jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  logs text[] not null default array[]::text[],

  error_message text,
  error_stack text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index neighbors_pipeline_logs_created_at_idx
  on neighbors_pipeline_logs (created_at desc);
create index neighbors_pipeline_logs_pipeline_idx
  on neighbors_pipeline_logs (pipeline);
create index neighbors_pipeline_logs_status_idx
  on neighbors_pipeline_logs (status);
create index neighbors_pipeline_logs_run_id_idx
  on neighbors_pipeline_logs (run_id);
create index neighbors_pipeline_logs_entity_idx
  on neighbors_pipeline_logs (entity_type, entity_id);
create index neighbors_pipeline_logs_user_id_idx
  on neighbors_pipeline_logs (user_id);
-- Only index failed rows for the common "show me problems" query
create index neighbors_pipeline_logs_failed_idx
  on neighbors_pipeline_logs (created_at desc)
  where status = 'failed';

alter table neighbors_pipeline_logs enable row level security;

-- Admin reads only. Writes are service-role (bypasses RLS).
create policy "admins read pipeline logs"
  on neighbors_pipeline_logs for select
  to authenticated
  using (
    exists (
      select 1 from neighbors_users
      where id = auth.uid() and is_admin = true
    )
  );
