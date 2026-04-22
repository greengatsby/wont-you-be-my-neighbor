-- Rounds should be visible to anyone who can see the parent event. Events
-- in status scheduled/live are publicly readable, so their rounds should be too.
-- Participants of any event (including ended) can still see the rounds they
-- were part of via the separate participant-based policy.

create policy "Rounds are visible for published events"
  on public.neighbors_rounds for select
  using (
    exists (
      select 1 from public.neighbors_events e
      where e.id = neighbors_rounds.event_id
        and e.status in ('scheduled', 'live')
    )
  );
