import Dexie from 'dexie'
import WaveformData from 'waveform-data'
import { toast } from 'react-toastify'

// from https://dexie.org/docs/Typescript

class EditorDatabase extends Dexie {
  tracks: Dexie.Table<Track, number>
  mixes: Dexie.Table<Mix, number>
  sets: Dexie.Table<Set, number>
  state: Dexie.Table<MixState | SetState>

  constructor () {
    super('EditorDatabase')
    this.version(1).stores({
      tracks: '++id, name, bpm, [name+size]',
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
  name?: string
  fileHandle?: FileSystemFileHandle
  dirHandle?: FileSystemDirectoryHandle
  size?: number
  type?: string
  lastModified?: number
  duration?: number
  bpm?: number
  sampleRate?: number
  offset?: number
}

interface MixPoint {
  times: number[]
  effects: any
}

interface Mix {
  id?: number
  tracks: number[]
  mixPoints: MixPoint[]
}

interface Set {
  id?: number
  mixes: number[]
}

interface TrackState extends Track {
  adjustedBpm?: number
  file?: File
  waveformData?: WaveformData
}

interface MixState {
  tracks?: TrackState[]
  bpmSync?: boolean
}

interface SetState {}

const db = new EditorDatabase()

db.on('populate', function () {
  // seed initial state here because other methods are only updates to these objects
  db.state.put({ tracks: [] }, 'mixState')
  db.state.put({}, 'setState')
})

const errHandler = (err: Error) => {
  toast.error(`Oops, there was a problem: ${err.message}`)
}

const getMixState = async (): Promise<MixState> =>
  (await db.state.get('mixState')) ?? {}
const getSetState = async (): Promise<SetState> =>
  (await db.state.get('setState')) ?? {}

const updateTrackState = async (state: TrackState) => {
  getMixState().then(async (currentState: MixState) => {
    const trackIndex = currentState.tracks!.findIndex(t => t.id == state.id)

    if (trackIndex! >= 0) {
      currentState.tracks![trackIndex!] = state
    } else currentState.tracks?.push(state)
    return await db.state.update('mixState', currentState)
  })
}
const updateMixState = async (state: MixState) => {
  getMixState().then(
    async (currentState: MixState) =>
      await db.state.update('mixState', { ...currentState, ...state })
  )
}
const updateSetState = async (state: SetState) => {
  getSetState().then(
    async (currentState: SetState) =>
      await db.state.update('setState', { ...currentState, ...state })
  )
}

const putTrack = async (track: Track): Promise<Track> => {
  const dup = await db.tracks.get({ name: track.name, size: track.size })
  if (dup && dup.bpm) return dup

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
  TrackState,
  Mix,
  MixState,
  Set,
  SetState,
  putTrack,
  removeTrack,
  addMix,
  getMix,
  removeMix,
  getMixState,
  getSetState,
  updateTrackState,
  updateMixState,
  updateSetState
}
