import Dexie from 'dexie'
import { toast } from 'react-toastify'

const db = new Dexie('DJSetEditor')
db.version(1).stores({
  tracks: '&name, bpm',
  mixes: '++id',
  sets: '++id'
})

const errHandler = err =>
  toast.error(`Oops, there was a problem: ${err.message}`)

const putTrack = async ({
  name,
  size,
  type,
  duration,
  bpm,
  sampleRate,
  offset,
  fileHandle
}) => {
  // Note this will overwrite an existing db entry with the same track name!
  await db.tracks
    .put({
      name,
      size,
      lastModified: Date.now(),
      type,
      duration,
      bpm,
      offset,
      sampleRate,
      fileHandle
    })
    .catch(errHandler)
}

const deleteTrack = name => db.tracks.delete(name).catch(errHandler)

export { db, putTrack, deleteTrack }
