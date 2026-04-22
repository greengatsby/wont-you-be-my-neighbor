-- Fix infinite recursion in neighbors_users RLS: admin-check policies that
-- query neighbors_users from inside a neighbors_users policy retrigger the
-- same policy set and Postgres errors out with a 500. Replace with a
-- SECURITY DEFINER helper that bypasses RLS.

create or replace function public.neighbors_is_admin(uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select is_admin from public.neighbors_users where id = uid), false);
$$;

revoke all on function public.neighbors_is_admin(uuid) from public;
grant execute on function public.neighbors_is_admin(uuid) to anon, authenticated, service_role;

drop policy if exists "Admins can view all users" on public.neighbors_users;
drop policy if exists "Admins can manage events" on public.neighbors_events;
drop policy if exists "Admins can manage rounds" on public.neighbors_rounds;

create policy "Admins can view all users"
  on public.neighbors_users for select
  using (public.neighbors_is_admin(auth.uid()));

create policy "Admins can manage events"
  on public.neighbors_events for all
  using (public.neighbors_is_admin(auth.uid()));

create policy "Admins can manage rounds"
  on public.neighbors_rounds for all
  using (public.neighbors_is_admin(auth.uid()));
