-- pgvector is already enabled in public schema

-- ============================================
-- neighbors_users
-- Profile data linked to auth.users
-- ============================================
create table neighbors_users (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text,
  display_name text,
  neighborhood text,
  is_admin boolean default false,
  consent_recording boolean default false,
  consent_ai_processing boolean default false,
  interest_embedding vector(1536),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- neighbors_interest_tags
-- Extracted interests per user, accumulated across events
-- ============================================
create table neighbors_interest_tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references neighbors_users(id) on delete cascade,
  tag text not null,
  confidence real default 1.0,
  source_event_id uuid, -- filled in after FK exists
  created_at timestamptz default now()
);

create index idx_interest_tags_user on neighbors_interest_tags(user_id);
create index idx_interest_tags_tag on neighbors_interest_tags(tag);

-- ============================================
-- neighbors_events
-- A scheduled or live event
-- ============================================
create table neighbors_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  host_id uuid not null references neighbors_users(id),
  scheduled_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'live', 'ended')),
  livekit_room_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_events_host on neighbors_events(host_id);
create index idx_events_status on neighbors_events(status);

-- Add FK for interest_tags -> events now that events exists
alter table neighbors_interest_tags
  add constraint fk_interest_tags_event
  foreign key (source_event_id) references neighbors_events(id) on delete set null;

-- ============================================
-- neighbors_event_participants
-- Users who joined an event
-- ============================================
create table neighbors_event_participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references neighbors_events(id) on delete cascade,
  user_id uuid not null references neighbors_users(id) on delete cascade,
  joined_at timestamptz default now(),
  left_at timestamptz,
  unique(event_id, user_id)
);

-- ============================================
-- neighbors_rounds
-- A round within an event's program
-- ============================================
create table neighbors_rounds (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references neighbors_events(id) on delete cascade,
  round_number integer not null,
  round_type text not null check (round_type in ('random', 'matched', 'topic')),
  duration_seconds integer not null default 300,
  prompt text,
  topic text, -- for topic-based rounds
  status text not null default 'pending' check (status in ('pending', 'active', 'completed')),
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz default now()
);

create index idx_rounds_event on neighbors_rounds(event_id);
create unique index idx_rounds_event_number on neighbors_rounds(event_id, round_number);

-- ============================================
-- neighbors_breakout_rooms
-- A room created during a round
-- ============================================
create table neighbors_breakout_rooms (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references neighbors_rounds(id) on delete cascade,
  livekit_room_name text not null,
  topic text,
  created_at timestamptz default now()
);

create index idx_breakout_rooms_round on neighbors_breakout_rooms(round_id);

-- ============================================
-- neighbors_room_members
-- Who was in which breakout room
-- ============================================
create table neighbors_room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references neighbors_breakout_rooms(id) on delete cascade,
  user_id uuid not null references neighbors_users(id) on delete cascade,
  joined_at timestamptz default now(),
  left_at timestamptz,
  unique(room_id, user_id)
);

create index idx_room_members_room on neighbors_room_members(room_id);
create index idx_room_members_user on neighbors_room_members(user_id);

-- ============================================
-- neighbors_recordings
-- Audio/video recordings from breakout rooms
-- ============================================
create table neighbors_recordings (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references neighbors_breakout_rooms(id) on delete cascade,
  egress_id text, -- LiveKit egress ID
  storage_url text, -- blob/s3 URL of the recording
  duration_seconds integer,
  transcription_status text not null default 'pending'
    check (transcription_status in ('pending', 'processing', 'completed', 'failed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_recordings_room on neighbors_recordings(room_id);
create index idx_recordings_status on neighbors_recordings(transcription_status);

-- ============================================
-- neighbors_transcripts
-- Transcribed segments from recordings
-- ============================================
create table neighbors_transcripts (
  id uuid primary key default gen_random_uuid(),
  recording_id uuid not null references neighbors_recordings(id) on delete cascade,
  speaker_user_id uuid references neighbors_users(id) on delete set null,
  text text not null,
  start_time real, -- seconds into recording
  end_time real,
  created_at timestamptz default now()
);

create index idx_transcripts_recording on neighbors_transcripts(recording_id);
create index idx_transcripts_speaker on neighbors_transcripts(speaker_user_id);

-- ============================================
-- neighbors_connections
-- Matched connections between users
-- ============================================
create table neighbors_connections (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references neighbors_users(id) on delete cascade,
  user_b uuid not null references neighbors_users(id) on delete cascade,
  shared_tags text[] default '{}',
  similarity_score real,
  event_id uuid references neighbors_events(id) on delete set null,
  contact_shared_a boolean default false,
  contact_shared_b boolean default false,
  created_at timestamptz default now(),
  check (user_a < user_b) -- enforce ordering to prevent duplicates
);

create unique index idx_connections_pair on neighbors_connections(user_a, user_b);
create index idx_connections_user_a on neighbors_connections(user_a);
create index idx_connections_user_b on neighbors_connections(user_b);

-- ============================================
-- Row Level Security
-- ============================================

alter table neighbors_users enable row level security;
alter table neighbors_interest_tags enable row level security;
alter table neighbors_events enable row level security;
alter table neighbors_event_participants enable row level security;
alter table neighbors_rounds enable row level security;
alter table neighbors_breakout_rooms enable row level security;
alter table neighbors_room_members enable row level security;
alter table neighbors_recordings enable row level security;
alter table neighbors_transcripts enable row level security;
alter table neighbors_connections enable row level security;

-- Users can read their own profile, admins can read all
create policy "Users can view own profile"
  on neighbors_users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on neighbors_users for update
  using (auth.uid() = id);

create policy "Admins can view all users"
  on neighbors_users for select
  using (
    exists (
      select 1 from neighbors_users u where u.id = auth.uid() and u.is_admin = true
    )
  );

-- Anyone can view published events
create policy "Anyone can view scheduled/live events"
  on neighbors_events for select
  using (status in ('scheduled', 'live'));

create policy "Admins can manage events"
  on neighbors_events for all
  using (
    exists (
      select 1 from neighbors_users u where u.id = auth.uid() and u.is_admin = true
    )
  );

-- Event participants
create policy "Users can view participants of events they joined"
  on neighbors_event_participants for select
  using (
    user_id = auth.uid() or
    exists (
      select 1 from neighbors_event_participants ep
      where ep.event_id = neighbors_event_participants.event_id and ep.user_id = auth.uid()
    )
  );

create policy "Users can join events"
  on neighbors_event_participants for insert
  with check (user_id = auth.uid());

-- Rounds are visible to event participants
create policy "Event participants can view rounds"
  on neighbors_rounds for select
  using (
    exists (
      select 1 from neighbors_event_participants ep
      where ep.event_id = neighbors_rounds.event_id and ep.user_id = auth.uid()
    )
  );

create policy "Admins can manage rounds"
  on neighbors_rounds for all
  using (
    exists (
      select 1 from neighbors_users u where u.id = auth.uid() and u.is_admin = true
    )
  );

-- Breakout rooms visible to members
create policy "Room members can view their rooms"
  on neighbors_breakout_rooms for select
  using (
    exists (
      select 1 from neighbors_room_members rm
      where rm.room_id = neighbors_breakout_rooms.id and rm.user_id = auth.uid()
    )
  );

-- Room members
create policy "Users can view their room memberships"
  on neighbors_room_members for select
  using (user_id = auth.uid());

-- Interest tags - users see their own
create policy "Users can view own interest tags"
  on neighbors_interest_tags for select
  using (user_id = auth.uid());

create policy "Users can manage own interest tags"
  on neighbors_interest_tags for delete
  using (user_id = auth.uid());

-- Connections - users see their own
create policy "Users can view own connections"
  on neighbors_connections for select
  using (user_a = auth.uid() or user_b = auth.uid());

create policy "Users can update own contact sharing"
  on neighbors_connections for update
  using (user_a = auth.uid() or user_b = auth.uid());

-- Transcripts - users can see transcripts from rooms they were in
create policy "Users can view transcripts from their rooms"
  on neighbors_transcripts for select
  using (
    exists (
      select 1 from neighbors_recordings r
      join neighbors_room_members rm on rm.room_id = r.room_id
      where r.id = neighbors_transcripts.recording_id and rm.user_id = auth.uid()
    )
  );

-- Recordings - users can see recordings from rooms they were in
create policy "Users can view recordings from their rooms"
  on neighbors_recordings for select
  using (
    exists (
      select 1 from neighbors_room_members rm
      where rm.room_id = neighbors_recordings.room_id and rm.user_id = auth.uid()
    )
  );

-- ============================================
-- Updated at triggers
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on neighbors_users
  for each row execute function update_updated_at();

create trigger set_updated_at before update on neighbors_events
  for each row execute function update_updated_at();

create trigger set_updated_at before update on neighbors_recordings
  for each row execute function update_updated_at();

-- ============================================
-- Function: Create user profile on signup
-- ============================================
create or replace function neighbors_handle_new_user()
returns trigger as $$
begin
  insert into neighbors_users (id, phone, display_name)
  values (
    new.id,
    new.phone,
    coalesce(new.raw_user_meta_data->>'display_name', 'Neighbor')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger neighbors_on_auth_user_created
  after insert on auth.users
  for each row execute function neighbors_handle_new_user();
