# Won't You Be My Neighbor — Developer Handoff

A guide for anyone picking this repo up to test, debug, or extend it.

---

## 1. What This App Does (The Story)

**Won't You Be My Neighbor** is an event platform for neighborhood meetups. It runs live video events where participants are rotated through short, paired conversations (like video speed-dating, but for community connection). After the event, recordings of every conversation are transcribed, analyzed by AI to extract each person's interests, and the system generates "connections" between participants who share overlapping interests.

**The user experience**:

1. An admin schedules an event with a series of *rounds*. Each round has a type:
   - `random` — everyone is paired randomly
   - `matched` — participants are paired based on interest similarity (from prior events)
   - `topic` — participants are grouped by shared interest tags, or everyone in one room around a specified topic
2. Participants RSVP and join the event lobby at the scheduled time.
3. Admin starts the event. Rounds run one at a time. When admin "dispatches" a round, the system creates LiveKit breakout rooms, pairs people, and opens the video UI for each participant. Recording starts automatically.
4. Each round has a countdown timer (e.g., 5 minutes). When admin ends the round, recordings stop, rooms close, and everyone returns to the lobby for the next round.
5. When admin ends the event, the server transcribes every recording (AssemblyAI), extracts interest tags per speaker (Claude), and stores "connections" between participants who share tags.
6. Participants see their connections on `/connections` with shared interest tags and can opt to share contact info.

---

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 App Router | Server + client in one codebase |
| Database + Auth | Supabase (Postgres + RLS + Auth + Realtime) | Single source of truth, realtime subscriptions for lobby state |
| Vector similarity | pgvector (built into Supabase Postgres) | For `interest_embedding` matched pairing |
| Video | LiveKit Cloud + `@livekit/components-react` | Rooms, video/audio tracks, room composite egress |
| Recording storage | Cloudflare R2 (S3-compatible) | LiveKit Egress writes directly to R2 |
| Transcription | AssemblyAI with speaker diarization | Fetches from public R2 URL |
| AI (interest extraction) | Anthropic Claude Sonnet | Structured JSON tag extraction from transcripts |
| UI kit | shadcn/ui + Tailwind | Design consistency |
| Deploy target | Vercel | Fluid Compute for the long-running `/end` route |

---

## 3. High-Level Architecture

```
                   ┌───────────────────────────────────────────────────┐
                   │                  Next.js App                      │
                   │                                                   │
Participant ◄──────┤  app/(app)/events/[id]/lobby/page.tsx             │
  browser          │  components/event-lobby.tsx  (realtime-subscribed)│
                   │  components/video-room.tsx    (LiveKit client)    │
                   └───┬──────────────────┬────────────────────────┬───┘
                       │                  │                        │
           Supabase Realtime     POST /api/events/...      POST /api/livekit/token
           (lobby state push)    (admin actions)           (per-room, gated by
                                                            neighbors_room_members)
                       │                  │                        │
                       ▼                  ▼                        ▼
                   ┌───────────────────────────────────────────────────┐
                   │  Supabase Postgres                                │
                   │  neighbors_events, _rounds, _breakout_rooms,      │
                   │  _room_members, _recordings, _transcripts,        │
                   │  _interest_tags, _connections                     │
                   └───────────────────────────────────────────────────┘
                                          ▲
                                          │ service-role writes
                   ┌───────────────────────┴──────────────────────────┐
                   │  API routes (admin-only)                          │
                   │  /dispatch  — create rooms, start egress          │
                   │  /rounds/[roundId]/end  — stop egress per round   │
                   │  /end  — stop everything, run pipeline            │
                   │  /transcribe, /process  — manual re-run endpoints │
                   └───┬───────────────────────────┬─────────────────┬─┘
                       │                           │                 │
                       ▼                           ▼                 ▼
              ┌────────────────┐          ┌────────────────┐  ┌─────────────┐
              │ LiveKit Cloud  │          │ Cloudflare R2  │  │ AssemblyAI  │
              │ • Rooms        │──egress─▶│ neighbors/     │◄─┤ (pulls URL) │
              │ • Egress       │          │  recordings/…  │  └──────┬──────┘
              └────────────────┘          └────────────────┘         │
                                                                     ▼
                                                            ┌────────────────┐
                                                            │ Anthropic API  │
                                                            │ (interest tags)│
                                                            └────────────────┘
```

---

## 4. Complete Event Lifecycle (Data Flow)

### Phase A — Setup (admin)
1. Admin visits `/admin` → creates a `neighbors_events` row (`status: 'scheduled'`) and one or more `neighbors_rounds`.
2. Participants visit the event URL → insert into `neighbors_event_participants`.

### Phase B — Live (admin hits Start)
3. `POST /api/events/[id]/start` sets `neighbors_events.status = 'live'`.
4. Realtime subscription in `event-lobby.tsx` pushes the status change to every connected participant.

### Phase C — Round dispatch
5. Admin clicks **Start** next to a pending round.
6. `POST /api/events/[id]/dispatch` (`dispatch/route.ts`):
   - Verifies round is `pending` and no other round is `active` (idempotent).
   - Fetches event participants.
   - Creates room groupings (random / matched / topic).
   - Atomically flips round status `pending → active` (`.eq('status','pending')` is the guard).
   - For each grouping: inserts a `neighbors_breakout_rooms` row + `neighbors_room_members` rows + calls `startRoomRecording` (LiveKit Egress → R2) + inserts a `neighbors_recordings` row with `transcription_status='pending'`.
7. Every participant's lobby receives an INSERT on `neighbors_room_members` via realtime → the client fetches the room + round info and mounts `<VideoRoom>`.
8. `<VideoRoom>` calls `POST /api/livekit/token` (validates room membership first), gets a JWT, connects to LiveKit. Countdown timer runs client-side from `round.started_at + duration_seconds`.

### Phase D — Round end (admin hits End Round)
9. `POST /api/events/[id]/rounds/[roundId]/end`:
   - Verifies the round is `active`.
   - Stops egress for every `pending` recording in that round.
   - Marks round `completed`.
10. Recordings stay in R2. `neighbors_recordings.transcription_status` is still `pending` — transcription happens at event end.

### Phase E — Event end (admin hits End Event)
11. `POST /api/events/[id]/end`:
    - Stops any remaining active egresses (defensive — should already be stopped per round).
    - Marks any active rounds `completed`.
    - Marks event `ended`.
    - **Calls `transcribeEventRecordings(eventId, admin)`** — for each pending recording: `pending → processing`, AssemblyAI transcribe from R2 public URL, insert `neighbors_transcripts` segments, `processing → completed` (or `failed`).
    - **Calls `processEventInterests(eventId, admin)`** — groups transcripts by speaker, asks Claude to extract interest tags per speaker, inserts `neighbors_interest_tags`, generates `neighbors_connections` across every pair of speakers who share tags.
    - Returns a summary.
12. Participants see connections on `/connections`.

---

## 5. Key Files

### API routes
| Path | Purpose |
|---|---|
| `src/app/api/events/[id]/start/route.ts` | Flip event `scheduled → live` |
| `src/app/api/events/[id]/dispatch/route.ts` | Create breakout rooms, start recording (idempotent) |
| `src/app/api/events/[id]/rounds/[roundId]/end/route.ts` | Stop round egress, mark round completed |
| `src/app/api/events/[id]/end/route.ts` | End event + run the full pipeline (transcribe + process) |
| `src/app/api/events/[id]/transcribe/route.ts` | Manual re-trigger of transcription (thin wrapper) |
| `src/app/api/events/[id]/process/route.ts` | Manual re-trigger of interest extraction (thin wrapper) |
| `src/app/api/livekit/token/route.ts` | Issue LiveKit JWT — gated by `neighbors_room_members` membership |
| `src/app/auth/callback/route.ts` | Supabase OAuth callback |

### Lib
| Path | Purpose |
|---|---|
| `src/lib/event-pipeline.ts` | Shared transcription + interest-extraction logic used by `/end`, `/transcribe`, `/process` |
| `src/lib/livekit.ts` | Egress client, `startRoomRecording`, `stopRoomRecording` |
| `src/lib/transcription.ts` | AssemblyAI client, `transcribeFromUrl` returns speaker-diarized segments |
| `src/lib/r2.ts` | R2 S3 client + helpers (upload, exists, delete) |
| `src/utils/supabase/{server,client,admin,middleware}.ts` | Supabase clients for every runtime context |

### Pages + components
| Path | Purpose |
|---|---|
| `src/app/(app)/page.tsx` | Home — upcoming and live events |
| `src/app/(app)/admin/page.tsx` | Admin dashboard |
| `src/app/(app)/events/[id]/lobby/page.tsx` | Per-event page wrapper |
| `src/app/(app)/connections/page.tsx` | User's connections from past events |
| `src/app/(app)/profile/page.tsx` | Profile + consent toggles |
| `src/components/event-lobby.tsx` | **Core lobby UI**. Realtime-subscribed, shows rounds, hosts Start/End Round + End Event controls, mounts `<VideoRoom>` when user is assigned |
| `src/components/video-room.tsx` | LiveKit room UI with timer + prompt |
| `src/components/admin-dashboard.tsx` | Event creation + round editor |
| `src/components/app-nav.tsx` | Sidebar nav |
| `src/components/connection-card.tsx` | Single connection row on `/connections` |
| `src/components/profile-editor.tsx` | Profile form + consent |

### Database
- `supabase/migrations/001_initial_schema.sql` — complete schema + RLS policies + triggers.
- `src/utils/supabase/types.ts` — generated types from `supabase gen types`.

---

## 6. Environment Setup

Required env vars (put in `.env.local`):

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon>
SUPABASE_SERVICE_ROLE_KEY=<service role — server-only>

# LiveKit Cloud
NEXT_PUBLIC_LIVEKIT_URL=wss://<project>.livekit.cloud
LIVEKIT_API_KEY=<api key>
LIVEKIT_API_SECRET=<api secret>

# Cloudflare R2
R2_ACCOUNT_ID=<cf account id>
R2_ACCESS_KEY_ID=<r2 token access key>
R2_SECRET_ACCESS_KEY=<r2 token secret>
R2_BUCKET_NAME=<bucket name>
R2_PUBLIC_URL=https://pub-<...>.r2.dev   # public bucket URL — required for AssemblyAI to fetch

# AssemblyAI
ASSEMBLYAI_API_KEY=<key>

# Anthropic
ANTHROPIC_API_KEY=<key>
```

**`R2_PUBLIC_URL` is mandatory** — the code now throws if it's missing. The bucket must also be publicly readable so AssemblyAI can fetch the audio; otherwise you need to switch to presigned URLs.

**Supabase setup**: push `supabase/migrations/001_initial_schema.sql` to a fresh project. The migration creates all tables, RLS policies, triggers, and an auth trigger (`neighbors_on_auth_user_created`) that auto-creates a `neighbors_users` row on signup. To grant yourself admin, flip `is_admin = true` on your `neighbors_users` row in SQL editor.

**LiveKit setup**: create an Egress-enabled project in LiveKit Cloud. Paste the API key + secret into `.env.local`. The code uses `startRoomCompositeEgress` with `audioOnly: true` → OGG files.

**R2 setup**: create a bucket, enable public access, copy the `pub-*.r2.dev` URL to `R2_PUBLIC_URL`. Create an API token with read/write on that bucket.

---

## 7. Running Locally

```bash
npm install
npm run dev   # http://localhost:3000
```

To test end-to-end you need **two browser sessions** (two accounts), because breakout rooms require ≥2 participants. Use an incognito window.

- Create two Supabase users (or log in with two Google accounts).
- Mark one as admin via SQL: `UPDATE neighbors_users SET is_admin = true WHERE id = '<uuid>';`
- As admin: create an event at `/admin` with 1–2 rounds (2 minute duration is fine for testing).
- Both users: visit the event URL, RSVP, go to the lobby.
- Admin: Start Event → Start Round → both browsers should auto-switch to a `<VideoRoom>`.
- Admin: End Round → both browsers return to lobby.
- Admin: End Event → watch the toast for the processing summary.
- Visit `/connections` on either user's account.

---

## 8. Recent Fixes (What Just Changed — 2026-04-17)

After an initial review flagged several issues, these were fixed in the working tree (uncommitted as of handoff):

1. **Dispatch is now idempotent.** `dispatch/route.ts` rejects if the round isn't `pending`, if another round is already `active`, and uses a status-guarded UPDATE to prevent races. Protects against double-clicks and retries.

2. **Per-round end endpoint added.** `POST /api/events/[id]/rounds/[roundId]/end` stops egress for that round's recordings and marks the round `completed`. Previously egresses only stopped at event end, which meant round 1 recordings could bleed into round 2 audio.

3. **Post-event processing runs server-side.** Transcription and interest extraction used to be chained `fetch` calls from the admin's browser — if the tab closed mid-way, the event was left half-processed. Now `POST /api/events/[id]/end` calls the shared pipeline directly on the server and returns a summary.

4. **LiveKit token endpoint enforces room membership.** Previously any authenticated user could join any room by name. Now verifies the user is in `neighbors_room_members` for the requested `livekit_room_name`.

5. **Shared pipeline extracted.** `src/lib/event-pipeline.ts` contains `transcribeEventRecordings` and `processEventInterests`. Used by `/end`, `/transcribe`, and `/process`.

6. **Misc**: `Math.random() - 0.5` shuffle replaced with Fisher-Yates; hardcoded R2 fallback URL removed (fails loud if env is missing); `createClient()` wrapped in `useMemo` inside `event-lobby.tsx` so realtime doesn't resubscribe every render.

---

## 9. Known Gaps — Things to Test and/or Fix

These are **real risks** in the current build. Please probe them.

### High priority

- **Speaker attribution is best-effort.** `event-pipeline.ts` maps AssemblyAI's `speaker: "A"` → `memberIds[0]` by DB insert order. The speaker letter is just the order AssemblyAI encountered them in audio — *not* a stable mapping to DB members. If participant B speaks first, their transcript will be attributed to participant A. The consequence: wrong tags → wrong connections. Options to fix: record each participant's audio on a separate track (per-participant egress) and skip diarization; or match voices via a short prompt at the start of each round.

- **`/end` route is long-running (minutes).** It synchronously transcribes every recording and calls Claude once per speaker. For an event with 10 rooms this can take 5+ minutes. Vercel's default timeout is 300s (Fluid Compute). For larger events this route *will* time out. Mitigation options: enqueue each recording with Vercel Queues or a background worker; use LiveKit's `egress_ended` webhook to trigger transcription per-recording as they finish; parallelize with `Promise.all` bounded concurrency.

- **`matched` round type is a stub.** `createMatchedPairs` reads `interest_embedding` but nothing ever writes to it. The stub pairs sequentially from the embedding list (not even true cosine similarity). Until embeddings are populated (e.g., by averaging per-user tag embeddings after each event), `matched` is effectively random — consider hiding that option in the UI.

- **`topic` with a specific topic puts everyone in one room.** No size cap. For 20 participants in a "Cooking" topic round you get a 20-way conversation.

- **Client-side timer does not enforce round end.** `<VideoRoom>` auto-leaves the UI when the countdown hits zero, but if the admin never presses End Round, the LiveKit egress keeps recording and the round status stays `active`. Admin discipline is required.

### Medium priority

- **No reconnection handling.** If a participant loses network mid-round, `onDisconnected` calls `handleLeaveRoom` which drops them out of the room with no way to rejoin until the next round.

- **Connections RLS may be too open.** `neighbors_connections` update policy lets either side update the row but doesn't restrict which columns. A malicious user could tamper with `similarity_score` or `shared_tags` on their connection rows. Also, the `/connections` page queries connected users' profile data — but `neighbors_users` SELECT policy only allows own-profile reads. Test whether the connection page actually loads data for connected users; if not, you'll need an additional policy allowing read of profiles linked via a shared `neighbors_connections` row.

- **No retry logic on transcription.** If AssemblyAI errors once, the recording is marked `failed` and stays there. `/transcribe` only picks up `pending` rows.

- **No dedup on interest tags.** Every event inserts a fresh row per tag per user. Over time the same tag accumulates — which may actually be desirable if you're weighting by frequency, but it's undocumented.

- **`confidence: 1.0` is hardcoded** on extracted tags. No model confidence signal is propagated.

### Low priority / cosmetic

- `neighbors_events` has no RLS policy for participants to see their drafts/past events.
- Host identity isn't shown anywhere in the lobby.
- No way for participants to leave an event after joining.
- No admin UI for editing a round after creation.

---

## 10. Debugging Playbook

**"Participants don't auto-join a breakout room when admin dispatches."**
- Open browser console. Check the Supabase realtime subscription is active (should see a `neighbors_room_members` INSERT in the network tab under WebSocket frames).
- Verify `neighbors_room_members` rows were created by the dispatch: SQL `SELECT * FROM neighbors_room_members WHERE user_id = '<uid>' ORDER BY joined_at DESC`.
- If rows exist but UI didn't update: the realtime channel isn't receiving events. Check Supabase project → Database → Replication → confirm `neighbors_room_members` has realtime enabled.

**"LiveKit token request returns 403 'Not assigned to this room'."**
- Expected if the user isn't in `neighbors_room_members` for that `livekit_room_name`. Check the dispatch ran successfully and inserted the membership row.
- Confirm the `roomName` passed to the token endpoint matches `neighbors_breakout_rooms.livekit_room_name` exactly.

**"Recording doesn't appear in R2."**
- Check `neighbors_recordings.egress_id` was populated — if null, the egress call threw (errors are logged but swallowed in `dispatch/route.ts:94`).
- In LiveKit Cloud dashboard → Egress — check the egress went into `EGRESS_FAILED` state. Usually means bad R2 credentials or missing bucket.
- `R2_BUCKET_NAME` env is required and must exist in your R2 account.

**"Transcription fails with 'cannot fetch audio_url'."**
- AssemblyAI is trying to GET the R2 public URL. The bucket must be publicly readable OR you need to switch to presigned URLs in `event-pipeline.ts`.
- Try the URL in a curl: `curl -I <storage_url>` — should return 200.

**"Claude interest extraction returns no tags."**
- Check `console.error('Failed to parse interests for user ...)`. The Claude response usually contains a JSON array, parsed by regex `/\[[\s\S]*\]/`. Claude occasionally wraps in markdown or prose. Consider using structured output / tool use instead of regex parsing.

**"`/end` route times out on Vercel."**
- Expected at scale. See Known Gaps §9. Short-term: cut the event short (fewer rooms / fewer rounds).

**"RLS prevents admin from seeing something."**
- Admin routes go through `createAdminClient()` which uses the service-role key and bypasses RLS. If a server route uses `createClient()` (user-scoped) for reads that need admin privileges, that's the bug.

**"Double-clicking Start Round creates duplicate rooms."**
- Should no longer happen (fixed). If it does, inspect `neighbors_rounds.status` in the DB — the atomic UPDATE guard depends on the status being `pending`.

---

## 11. Quick Reference — Running Smoke Tests

Three useful SQL queries while debugging:

```sql
-- All state for an event
select e.status, r.round_number, r.status as round_status, r.started_at, r.ended_at,
       br.livekit_room_name, rec.transcription_status, rec.egress_id
from neighbors_events e
left join neighbors_rounds r on r.event_id = e.id
left join neighbors_breakout_rooms br on br.round_id = r.id
left join neighbors_recordings rec on rec.room_id = br.id
where e.id = '<event-uuid>'
order by r.round_number, br.created_at;

-- Who got tagged with what at this event
select u.display_name, t.tag, t.confidence
from neighbors_interest_tags t
join neighbors_users u on u.id = t.user_id
where t.source_event_id = '<event-uuid>'
order by u.display_name, t.tag;

-- Connections generated
select ua.display_name as user_a, ub.display_name as user_b,
       c.shared_tags, c.similarity_score
from neighbors_connections c
join neighbors_users ua on ua.id = c.user_a
join neighbors_users ub on ub.id = c.user_b
where c.event_id = '<event-uuid>';
```

---

Good luck. File issues or ping Dane (`dane@roley.ai`) if you get stuck.
