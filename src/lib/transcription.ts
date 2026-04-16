import { AssemblyAI } from 'assemblyai'

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
})

export interface TranscriptSegment {
  speakerIndex: number
  text: string
  startTime: number
  endTime: number
}

/**
 * Transcribe an audio file from a URL using AssemblyAI.
 * Returns speaker-diarized transcript segments.
 */
export async function transcribeFromUrl(audioUrl: string): Promise<TranscriptSegment[]> {
  const transcript = await client.transcripts.transcribe({
    audio_url: audioUrl,
    speaker_labels: true,
  })

  if (transcript.status === 'error') {
    throw new Error(`AssemblyAI transcription failed: ${transcript.error}`)
  }

  const segments: TranscriptSegment[] = []

  if (transcript.utterances) {
    for (const utterance of transcript.utterances) {
      // AssemblyAI speaker labels are like "A", "B", etc.
      const speakerIndex = utterance.speaker.charCodeAt(0) - 'A'.charCodeAt(0)
      segments.push({
        speakerIndex,
        text: utterance.text,
        startTime: utterance.start / 1000, // ms to seconds
        endTime: utterance.end / 1000,
      })
    }
  }

  return segments
}
