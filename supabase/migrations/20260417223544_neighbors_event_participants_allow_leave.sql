-- Let users remove their own participant row (i.e. "leave" a scheduled event).
create policy "Users can leave events"
  on public.neighbors_event_participants for delete
  using (user_id = auth.uid());
