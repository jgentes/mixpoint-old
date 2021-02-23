
import Dexie from 'dexie';

export { db, addTrack }

const db = new Dexie('DJSetEditor');
db.version(1).stores({
  tracks: '&name, bpm',
  mixes: '++id',
  sets: '++id'
});

const addTrack = (name, size, lastModified, type, duration, bpm, sampleRate, peaks, fileHandle) => {
  db.tracks.add({
    name,
    size,
    lastModified,
    type,
    duration,
    bpm,
    analysis: {
      sampleRate,
      peaks
    },
    fileHandle
  })
    .catch(e => console.error(`Oops, there was a problem: ${e.message}`));
}