import Dexie from 'dexie'
import { toast } from 'react-toastify'

// from https://dexie.org/docs/Typescript

class EditorDatabase extends Dexie {
  tracks: Dexie.Table<Track, string>
  mixes: Dexie.Table<Mix, number>
  sets: Dexie.Table<Set, number>
  state: Dexie.Table<trackState | mixState | setState | undefined>

  constructor () {
    super('EditorDatabase')
    this.version(1).stores({
      tracks: '&name, bpm',
      mixes: '++id',
      sets: '++id',
      state: ''
    })

    this.tracks = this.table('tracks')
    this.mixes = this.table('mixes')
    this.sets = this.table('sets')
    this.state = this.table('state')
  }
}

// define tables
interface Track {
  name: string
  fileHandle: FileSystemFileHandle
  dirHandle?: FileSystemDirectoryHandle
  size?: number
  type?: string
  lastModified?: number
  duration?: number
  bpm?: number
  sampleRate?: number
  offset?: number
}

interface Mix {
  id?: number
}

interface Set {
  id?: number
}

interface trackState {}

interface mixState {
  [key: string]: any
  bpmSync?: boolean
}

interface setState {}

const db = new EditorDatabase()

db.on('populate', function () {
  // seed initial objects here because other methods are only updates to these objects
  db.state.put({}, 'trackState')
  db.state.put({}, 'mixState')
  db.state.put({}, 'setState')
})

const errHandler = (err: Error) => {
  toast.error(`Oops, there was a problem: ${err.message}`)
}

const getTrackState = async (): Promise<trackState> =>
  (await db.state.get('trackState')) ?? {}
const getMixState = async (): Promise<mixState> =>
  (await db.state.get('mixState')) ?? {}
const getSetState = async (): Promise<setState> =>
  (await db.state.get('setState')) ?? {}

const updateTrackState = async (state: trackState) => {
  getTrackState().then(
    async (currentState: trackState) =>
      await db.state.update('trackState', { ...currentState, ...state })
  )
}
const updateMixState = async (state: mixState) => {
  getMixState().then(
    async (currentState: mixState) =>
      await db.state.update('mixState', { ...currentState, ...state })
  )
}
const updateSetState = async (state: setState) => {
  getSetState().then(
    async (currentState: setState) =>
      await db.state.update('setState', { ...currentState, ...state })
  )
}

// Note this will overwrite an existing db entry with the same track name!
const putTrack = async (track: Track): Promise<string> => {
  track.lastModified = Date.now()
  return await db.tracks.put(track).catch(errHandler)
}

const updateTrack = async (track: Track): Promise<number> => {
  track.lastModified = Date.now()
  return await db.tracks.update(track.name, track).catch(errHandler)
}

const putTracks = async (tracks: Track[]) => {
  return await db.tracks.bulkPut(tracks).catch(errHandler)
}

const removeTrack = (name: string): Promise<void> =>
  db.tracks.delete(name).catch(errHandler)

export {
  db,
  Track,
  trackState,
  Mix,
  mixState,
  Set,
  setState,
  putTrack,
  updateTrack,
  putTracks,
  removeTrack,
  getTrackState,
  getMixState,
  getSetState,
  updateTrackState,
  updateMixState,
  updateSetState
}
