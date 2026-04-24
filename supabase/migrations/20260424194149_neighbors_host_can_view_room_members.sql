-- Hosts and admins need to see every active room membership for their event
-- so Host Controls and the Monitor Grid can render participant counts, member
-- names, and decide which breakouts to render. The existing "Users can view
-- their room memberships" policy only exposes rows where user_id=auth.uid(),
-- which makes every breakout look empty to the host.
create policy "Event hosts and admins can view event room members"
  on neighbors_room_members for select
  using (
    public.neighbors_is_admin(auth.uid())
    or exists (
      select 1
      from neighbors_rooms r
      join neighbors_events e on e.id = r.event_id
      where r.id = neighbors_room_members.room_id
        and e.host_id = auth.uid()
    )
  );
