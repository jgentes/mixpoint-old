import { db, putTrack } from './db'
import { guess } from 'web-audio-beat-detector'

const getAudioBuffer = async file => {
  const arrayBuffer = await file.arrayBuffer()
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
  return { audioBuffer, audioCtx }
}

const getBpm = async buffer => await guess(buffer)

const processTrack = async fileHandle => {
  const file = await fileHandle.getFile()
  const { name, size, type } = file

  const { audioBuffer, audioCtx } = await getAudioBuffer(file)
  const { duration, sampleRate } = audioBuffer
  const { offset, tempo } = await getBpm(audioBuffer)

  await putTrack({
    name,
    size,
    type,
    duration,
    bpm: tempo,
    offset,
    sampleRate,
    fileHandle
  })

  const track = await db.tracks.get(name)
  return { track, audioBuffer, audioCtx, bpm: tempo, offset }
}

export { getAudioBuffer, processTrack, getBpm }
