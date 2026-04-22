-- Enable Supabase Realtime broadcasts on the tables the lobby + video UI
-- subscribe to. Without these, the client never sees room assignment inserts,
-- event status flips, or round status changes, and the UI appears frozen.
alter publication supabase_realtime add table public.neighbors_room_members;
alter publication supabase_realtime add table public.neighbors_rounds;
alter publication supabase_realtime add table public.neighbors_events;
alter publication supabase_realtime add table public.neighbors_event_participants;
