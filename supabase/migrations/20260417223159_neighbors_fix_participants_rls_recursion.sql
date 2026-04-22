-- "Users can view participants of events they joined" on neighbors_event_participants
-- self-references the same table from inside its own policy → infinite recursion.
-- Replace with a SECURITY DEFINER helper so the membership check bypasses RLS.

create or replace function public.neighbors_is_event_participant(evt uuid, uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.neighbors_event_participants
    where event_id = evt and user_id = uid
  );
$$;

revoke all on function public.neighbors_is_event_participant(uuid, uuid) from public;
grant execute on function public.neighbors_is_event_participant(uuid, uuid) to anon, authenticated, service_role;

drop policy if exists "Users can view participants of events they joined" on public.neighbors_event_participants;
drop policy if exists "Event participants can view rounds" on public.neighbors_rounds;
drop policy if exists "Room members can view their rooms" on public.neighbors_breakout_rooms;

create policy "Users can view participants of events they joined"
  on public.neighbors_event_participants for select
  using (
    user_id = auth.uid()
    or public.neighbors_is_event_participant(event_id, auth.uid())
  );

create policy "Event participants can view rounds"
  on public.neighbors_rounds for select
  using (public.neighbors_is_event_participant(event_id, auth.uid()));

create policy "Room members can view their rooms"
  on public.neighbors_breakout_rooms for select
  using (
    exists (
      select 1 from public.neighbors_room_members rm
      where rm.room_id = neighbors_breakout_rooms.id
        and rm.user_id = auth.uid()
    )
  );
