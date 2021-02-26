import Dexie from 'dexie'
import { toast } from 'react-toastify'

export { db, putTrack, deleteTrack }

const db = new Dexie('DJSetEditor')
db.version(1).stores({
  tracks: '&name, bpm',
  mixes: '++id',
  sets: '++id'
})

const errHandler = err => toast.error(`Oops, there was a problem: ${err.message}`)

const putTrack = ({ name, size, type, duration, bpm, sampleRate, peaks, fileHandle }) => {
  // Note this will overwrite an existing db entry with the same track name!
  db.tracks.put({
    name,
    size,
    lastModified: Date.now(),
    type,
    duration,
    bpm,
    analysis: {
      sampleRate,
      peaks
    },
    fileHandle
  })
    .catch(errHandler)
}

const deleteTrack = name => db.tracks.delete(name).catch(errHandler)
