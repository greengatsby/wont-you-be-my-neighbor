-- Hosts and admins need to see every room in their event (main, breakouts,
-- ad-hoc) even when they aren't a member of that specific room. Without this,
-- the "Room members can view their rooms" policy hides every breakout from
-- the host's browser, so Host Controls and the Monitor Grid can't render
-- them even though the server-side insert succeeded.
create policy "Event hosts and admins can view event rooms"
  on neighbors_rooms for select
  using (
    public.neighbors_is_admin(auth.uid())
    or exists (
      select 1 from neighbors_events e
      where e.id = neighbors_rooms.event_id
        and e.host_id = auth.uid()
    )
  );
