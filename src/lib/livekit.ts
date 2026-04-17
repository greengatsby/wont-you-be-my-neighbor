import {
  EgressClient,
  EncodedFileOutput,
  EncodedFileType,
  S3Upload,
} from 'livekit-server-sdk'

const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL!
const apiKey = process.env.LIVEKIT_API_KEY!
const apiSecret = process.env.LIVEKIT_API_SECRET!

export function getEgressClient() {
  return new EgressClient(livekitUrl, apiKey, apiSecret)
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
 * Stop an egress recording.
 */
export async function stopRoomRecording(egressId: string) {
  const client = getEgressClient()
  return client.stopEgress(egressId)
}
