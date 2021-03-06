import { putTrack } from './db'
import { guess } from 'web-audio-beat-detector'

const getAudioBuffer = async file => {
  const arrayBuffer = await file.arrayBuffer()
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  return await audioCtx.decodeAudioData(arrayBuffer)
}

const getBpm = async buffer => await guess(buffer)

const processTrack = async fileHandle => {
  const file = await fileHandle.getFile()
  const { name, size, type } = file

  const audioBuffer = await getAudioBuffer(file)
  const { duration, sampleRate } = audioBuffer
  const { offset, tempo } = await getBpm(audioBuffer)

  // adjust for miscalc tempo > 160bpm
  const bpm = tempo > 160 ? tempo / 2 : tempo

  const track = {
    name,
    size,
    type,
    duration,
    bpm,
    offset,
    sampleRate,
    fileHandle
  }

  await putTrack(track)

  return track
}

export { getAudioBuffer, processTrack, getBpm }
