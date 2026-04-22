-- ============================================
-- Migration 002: Main room + host controls
--
-- Rename neighbors_breakout_rooms → neighbors_rooms so it can hold the
-- event's main room and ad-hoc rooms alongside round-scoped breakouts.
-- Add role column to room_members so hosts can join breakouts as hosts.
-- Add ends_at to rounds for client/server timer auto-end.
-- ============================================

-- 1) Rename the table. Postgres carries FK constraints, indexes, and RLS
--    policies through the rename, so neighbors_room_members.room_id and
--    neighbors_recordings.room_id continue to point at the same table.
alter table neighbors_breakout_rooms rename to neighbors_rooms;

-- 2) round_id is no longer required (main and adhoc rooms have no round).
alter table neighbors_rooms alter column round_id drop not null;

-- 3) event_id is required so we can look up all rooms for an event directly.
alter table neighbors_rooms
  add column event_id uuid references neighbors_events(id) on delete cascade;

update neighbors_rooms r
  set event_id = (select event_id from neighbors_rounds where id = r.round_id)
  where round_id is not null;

alter table neighbors_rooms alter column event_id set not null;

-- 4) room_type distinguishes main vs breakout vs ad-hoc rooms.
alter table neighbors_rooms
  add column room_type text not null default 'breakout'
  check (room_type in ('main', 'breakout', 'adhoc'));

-- 5) Indexes. The old idx_breakout_rooms_round still exists and still works
--    (carried through the rename); rename it for clarity and add event_id.
alter index if exists idx_breakout_rooms_round rename to idx_rooms_round;
create index if not exists idx_rooms_event on neighbors_rooms(event_id);

-- 6) Guarantee at most one main room per event.
create unique index if not exists idx_rooms_event_main
  on neighbors_rooms(event_id)
  where room_type = 'main';

-- 7) RLS: participants can also see the main room they are (or will be) in.
--    Old "Room members can view their rooms" policy still applies; add a
--    broader one for the main room so participants see it even before any
--    explicit membership row (e.g. in-flight lobby load).
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

-- ============================================
-- neighbors_room_members: role column
-- ============================================
alter table neighbors_room_members
  add column role text not null default 'participant'
  check (role in ('participant', 'host'));

-- ============================================
-- neighbors_rounds: ends_at for timer auto-end
-- ============================================
alter table neighbors_rounds
  add column ends_at timestamptz;

-- Backfill ends_at for any already-active or completed rounds so
-- auto-end logic doesn't immediately re-trigger on existing data.
update neighbors_rounds
  set ends_at = started_at + (duration_seconds || ' seconds')::interval
  where started_at is not null and ends_at is null;
