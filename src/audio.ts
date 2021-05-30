import { Track, putTrack } from './db'
import { failure } from './utils'
import { getPermission } from './fileHandlers'
import { guess } from 'web-audio-beat-detector'

const initTrack = async (
  fileHandle: FileSystemFileHandle,
  dirHandle?: FileSystemDirectoryHandle
) => {
  const { name, size, type } = await fileHandle.getFile()
  const track = { name, size, type, fileHandle, dirHandle }

  return track
}

const getAudioBuffer = async (file: File): Promise<AudioBuffer> => {
  const arrayBuffer = await file.arrayBuffer()
  const audioCtx = new window.AudioContext()
  return await audioCtx.decodeAudioData(arrayBuffer)
}

const getBpm = async (
  buffer: AudioBuffer
): Promise<{ offset: number; bpm: number }> => await guess(buffer)

const processAudio = async (track: Track): Promise<Track | undefined> => {
  if (!track.fileHandle) throw Error('Please try adding the Track again')

  const file = await getPermission(track)
  if (!file) return // this would be due to denial of permission

  const { name, size, type } = file

  const audioBuffer = await getAudioBuffer(file)

  const { duration, sampleRate } = audioBuffer

  let offset = 0,
    bpm = 1

  try {
    ;({ offset, bpm } = await getBpm(audioBuffer))
  } catch (e) {
    failure(undefined, `Unable to determine BPM for ${name}`)
  }

  // adjust for miscalc tempo > 160bpm
  const adjustedBpm = bpm > 160 ? bpm / 2 : bpm

  const updatedTrack = {
    ...track,
    name,
    size,
    type,
    duration,
    bpm: adjustedBpm,
    offset,
    sampleRate
  }

  await putTrack(updatedTrack)

  return updatedTrack
}

export { getAudioBuffer, processAudio, getBpm, initTrack }
