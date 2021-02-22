
import Dexie from 'dexie';

/* Track Schema (not enforced)
{
  name: String,
  filename: String,
  size: Number,
  uploaded: { type: Date, default: Date.now },
  duration: Number,
  bpm: Number,
  mixes: Array,
  sets: Array,
  analysis: {
    sampleRate: Number,
    peaks: Array
  }
};
*/

const db = new Dexie('DJSetEditor');
db.version(1).stores({
  tracks: '++id, name, bpm',
  mixes: '++id',
  sets: '++id'
});

db.table('tracks')
  .add({
    name: 'Test Track',
    size: 12542351,
    uploaded: Date.now(),
    duration: 1241243,
    bpm: 78,
    mixes: 2,
    sets: 1,
    analysis: {
      sampleRate: 44100,
      peaks: []
    }
  })

export default db;