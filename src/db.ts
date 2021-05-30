import Dexie from 'dexie'
import { toast } from 'react-toastify'

// from https://dexie.org/docs/Typescript

class EditorDatabase extends Dexie {
  tracks: Dexie.Table<Track, number>
  mixes: Dexie.Table<Mix, number>
  sets: Dexie.Table<Set, number>
  state: Dexie.Table<trackState | mixState | setState | undefined>

  constructor () {
    super('EditorDatabase')
    this.version(1).stores({
      tracks: '++id, name, bpm',
      mixes: '++id, tracks',
      sets: '++id, mixes',
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
  id?: number
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
  tracks: number[]
}

interface Set {
  id?: number
  mixes: number[]
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

const putTrack = async (track: Track): Promise<Track> => {
  track.lastModified = Date.now()
  const id = await db.tracks.put(track).catch(errHandler)
  track.id = id
  return track
}

const removeTrack = async (id: number): Promise<void> =>
  await db.tracks.delete(id).catch(errHandler)

const addMix = async (tracks: number[]): Promise<number> =>
  await db.mixes.add({ tracks }).catch(errHandler)

const getMix = async (id: number): Promise<Mix | undefined> =>
  await db.mixes.get(id).catch(errHandler)

const removeMix = async (id: number): Promise<void> =>
  await db.mixes.delete(id).catch(errHandler)

export {
  db,
  Track,
  trackState,
  Mix,
  mixState,
  Set,
  setState,
  putTrack,
  removeTrack,
  addMix,
  getMix,
  removeMix,
  getTrackState,
  getMixState,
  getSetState,
  updateTrackState,
  updateMixState,
  updateSetState
}
