-- The first cut at "hosts can see all event rooms + members" used inline
-- EXISTS subqueries against neighbors_rooms / neighbors_events from inside
-- RLS policies on neighbors_room_members and neighbors_rooms themselves.
-- That creates a policy-evaluation cycle — a SELECT on neighbors_rooms
-- triggers RLS on neighbors_room_members (via the existing "Room members
-- can view their rooms" policy), which in turn triggers RLS on
-- neighbors_rooms, and Postgres returns 500. Wrap the checks in
-- SECURITY DEFINER functions to break the cycle (same pattern as
-- neighbors_is_admin).

create or replace function public.neighbors_user_hosts_event(eid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.neighbors_events
    where id = eid and host_id = auth.uid()
  );
$$;

create or replace function public.neighbors_user_can_host_room(rid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.neighbors_rooms r
    join public.neighbors_events e on e.id = r.event_id
    where r.id = rid and e.host_id = auth.uid()
  );
$$;

revoke all on function public.neighbors_user_hosts_event(uuid) from public;
revoke all on function public.neighbors_user_can_host_room(uuid) from public;
grant execute on function public.neighbors_user_hosts_event(uuid) to anon, authenticated, service_role;
grant execute on function public.neighbors_user_can_host_room(uuid) to anon, authenticated, service_role;

drop policy if exists "Event hosts and admins can view event room members"
  on neighbors_room_members;
drop policy if exists "Event hosts and admins can view event rooms"
  on neighbors_rooms;

create policy "Event hosts and admins can view event room members"
  on neighbors_room_members for select
  using (
    public.neighbors_is_admin(auth.uid())
    or public.neighbors_user_can_host_room(neighbors_room_members.room_id)
  );

create policy "Event hosts and admins can view event rooms"
  on neighbors_rooms for select
  using (
    public.neighbors_is_admin(auth.uid())
    or public.neighbors_user_hosts_event(neighbors_rooms.event_id)
  );
