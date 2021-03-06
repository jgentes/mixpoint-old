import Dexie from 'dexie'
import { toast } from 'react-toastify'

const db = new Dexie('DJSetEditor')
db.version(1).stores({
  tracks: '&name, bpm',
  mixes: '++id',
  sets: '++id',
  state: ''
})

db.on('populate', function () {
  // 'put' initial objects here because other methods are only updates to these objects
  db.state.put({}, 'trackState')
  db.state.put({}, 'mixState')
  db.state.put({}, 'setState')
})

const errHandler = err =>
  toast.error(`Oops, there was a problem: ${err.message}`)

const getTrackState = async () => await db.state.get('trackState')
const getMixState = async () => await db.state.get('mixState')
const getSetState = async () => await db.state.get('setState')

const updateTrackState = async state =>
  await db.state.update('trackState', state)
const updateMixState = async state => await db.state.update('mixState', state)
const updateSetState = async state => await db.state.update('setState', state)

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

export {
  db,
  putTrack,
  deleteTrack,
  getTrackState,
  getMixState,
  getSetState,
  updateTrackState,
  updateMixState,
  updateSetState
}
