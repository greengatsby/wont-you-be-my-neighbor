import {
  EgressClient,
  EncodedFileOutput,
  EncodedFileType,
  RoomServiceClient,
  S3Upload,
} from 'livekit-server-sdk'

const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL!
const apiKey = process.env.LIVEKIT_API_KEY!
const apiSecret = process.env.LIVEKIT_API_SECRET!

export function getEgressClient() {
  return new EgressClient(livekitUrl, apiKey, apiSecret)
}

export function getRoomClient() {
  return new RoomServiceClient(livekitUrl, apiKey, apiSecret)
}

// Explicitly create a LiveKit room with a long empty-timeout. Needed for the
// main event room, which must survive periods where everyone has moved to
// breakouts — the default 5-minute empty-timeout would tear it down.
export async function ensureRoom(name: string, emptyTimeoutSeconds = 4 * 60 * 60) {
  const client = getRoomClient()
  try {
    await client.createRoom({ name, emptyTimeout: emptyTimeoutSeconds })
  } catch (err: any) {
    // Already exists is fine — createRoom is not idempotent server-side.
    if (!/already exists/i.test(err?.message || '')) throw err
  }
}

/**
 * Start a room composite egress that records the entire room's audio
 * and uploads it to R2 (S3-compatible) under the neighbors/ folder.
 */
export async function startRoomRecording(roomName: string, roomId: string) {
  const client = getEgressClient()

  const timestamp = Date.now()
  const r2Key = `neighbors/recordings/${roomId}/${timestamp}.ogg`

  const fileOutput = new EncodedFileOutput({
    fileType: EncodedFileType.OGG,
    filepath: r2Key,
    output: {
      case: 's3',
      value: new S3Upload({
        accessKey: process.env.R2_ACCESS_KEY_ID!,
        secret: process.env.R2_SECRET_ACCESS_KEY!,
        bucket: process.env.R2_BUCKET_NAME!,
        endpoint: process.env.R2_ENDPOINT ||
          `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        region: 'auto',
        forcePathStyle: true,
      }),
    },
  })

  const egressInfo = await client.startRoomCompositeEgress(
    roomName,
    { file: fileOutput },
    { audioOnly: true }
  )

  if (!process.env.R2_PUBLIC_URL) {
    throw new Error('R2_PUBLIC_URL env var is required')
  }
  const publicUrl = `${process.env.R2_PUBLIC_URL}/${r2Key}`

  return {
    egressId: egressInfo.egressId,
    r2Key,
    storageUrl: publicUrl,
  }
}

/**
 * Stop an egress recording. Idempotent: if LiveKit has already moved the
 * egress to a terminal state (e.g. auto-aborted when the room emptied),
 * stopEgress returns 412 failed_precondition — treat that as success.
 */
export async function stopRoomRecording(egressId: string) {
  const client = getEgressClient()
  try {
    return await client.stopEgress(egressId)
  } catch (err: any) {
    const alreadyTerminal =
      err?.code === 'failed_precondition' ||
      err?.status === 412 ||
      /cannot be stopped|already|aborted|complete/i.test(err?.message || '')
    if (alreadyTerminal) return null
    throw err
  }
}

/**
 * Delete a LiveKit room by name. Idempotent: if the room has already been
 * cleaned up (auto-closed after emptyTimeout, never existed, etc.) we treat
 * that as success. Disconnects any still-connected participants.
 */
export async function deleteLiveKitRoom(roomName: string) {
  const client = getRoomClient()
  try {
    await client.deleteRoom(roomName)
  } catch (err: any) {
    const notFound =
      err?.code === 'not_found' ||
      err?.status === 404 ||
      /not found|does not exist/i.test(err?.message || '')
    if (notFound) return
    throw err
  }
}
