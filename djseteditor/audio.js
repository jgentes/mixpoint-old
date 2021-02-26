import React from 'react'
import { db, putTrack } from './db'
import { toast } from 'react-toastify'
import { guess } from 'web-audio-beat-detector'
export { getAudioBuffer, processTrack }

const getAudioBuffer = async file => {
  const arrayBuffer = await file.arrayBuffer()
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
  return { audioBuffer, audioCtx }
}

const processTrack = async (fileHandle, options) => {
  const file = await fileHandle.getFile()

  const { name, size, type } = file

  const { audioBuffer, audioCtx } = await getAudioBuffer(file)

  const { offset, tempo } = await guess(audioBuffer)
  let duration, sampleRate, bpm, peaks, renderedBuffer

  putTrack({ name, size, type, duration, bpm, sampleRate, peaks, fileHandle })

  toast.success(<>Loaded <strong>{name}</strong></>)

  const track = await db.tracks.get(name)
  return { track, audioBuffer, audioCtx, renderedBuffer, bpm, offset, tempo }
}
