-- Rename neighbors_breakout_rooms → neighbors_rooms so it can hold the
-- event's main room and ad-hoc rooms alongside round-scoped breakouts.
alter table neighbors_breakout_rooms rename to neighbors_rooms;

-- round_id is no longer required (main and adhoc rooms have no round).
alter table neighbors_rooms alter column round_id drop not null;

-- event_id is required so we can look up all rooms for an event directly.
alter table neighbors_rooms
  add column event_id uuid references neighbors_events(id) on delete cascade;

update neighbors_rooms r
  set event_id = (select event_id from neighbors_rounds where id = r.round_id)
  where round_id is not null;

alter table neighbors_rooms alter column event_id set not null;

-- room_type distinguishes main vs breakout vs ad-hoc rooms.
alter table neighbors_rooms
  add column room_type text not null default 'breakout'
  check (room_type in ('main', 'breakout', 'adhoc'));

alter index if exists idx_breakout_rooms_round rename to idx_rooms_round;
create index if not exists idx_rooms_event on neighbors_rooms(event_id);

-- At most one main room per event.
create unique index if not exists idx_rooms_event_main
  on neighbors_rooms(event_id)
  where room_type = 'main';

-- Participants see the main room even before an explicit membership row exists.
create policy "Event participants can view the main room"
  on neighbors_rooms for select
  using (
    room_type = 'main'
    and exists (
      select 1 from neighbors_event_participants ep
      where ep.event_id = neighbors_rooms.event_id
        and ep.user_id = auth.uid()
    )
  );

-- Host/participant distinction on room memberships.
alter table neighbors_room_members
  add column role text not null default 'participant'
  check (role in ('participant', 'host'));

-- ends_at for timer auto-end (server + client can both trigger end idempotently).
alter table neighbors_rounds
  add column ends_at timestamptz;

update neighbors_rounds
  set ends_at = started_at + (duration_seconds || ' seconds')::interval
  where started_at is not null and ends_at is null;
