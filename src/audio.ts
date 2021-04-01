import { Track, putTrack, db } from './db'
import { success, failure } from './utils'
import { guess } from 'web-audio-beat-detector'

const getAudioBuffer = async (file: File): Promise<AudioBuffer> => {
  const arrayBuffer = await file.arrayBuffer()
  const audioCtx = new window.AudioContext()
  return await audioCtx.decodeAudioData(arrayBuffer)
}

const getBpm = async (
  buffer: AudioBuffer
): Promise<{ offset: number; bpm: number }> => await guess(buffer)

const processTrack = async (
  fileHandle: FileSystemFileHandle | null
): Promise<Track | undefined> => {
  if (!fileHandle) throw new Error('Unable to obtain file handle')

  const file = await fileHandle.getFile()
  const { name, size, type } = file

  const audioBuffer = await getAudioBuffer(file)
  const { duration, sampleRate } = audioBuffer
  let offset = 0,
    bpm = 1
  try {
    ;({ offset, bpm } = await getBpm(audioBuffer))
  } catch (e) {
    failure(undefined, `Unable to determine BPM for <strong>${name}</strong>`)
  }

  // adjust for miscalc tempo > 160bpm
  const adjustedBpm = bpm > 160 ? bpm / 2 : bpm

  const track = {
    name,
    size,
    type,
    duration,
    bpm: adjustedBpm,
    offset,
    sampleRate,
    fileHandle
  }

  await putTrack(track)

  if (!track) failure()
  else success(track.name)

  return db.tracks.get(name)
}

export { getAudioBuffer, processTrack, getBpm }
