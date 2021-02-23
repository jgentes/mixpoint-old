
import Dexie from 'dexie';

export { db, putTrack, deleteTrack }

const db = new Dexie('DJSetEditor');
db.version(1).stores({
  tracks: '&name, bpm',
  mixes: '++id',
  sets: '++id'
});

const putTrack = (name, size, type, duration, bpm, sampleRate, peaks, fileHandle) => {
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
    .catch(e => console.error(`Oops, there was a problem: ${e.message}`));
}

const deleteTrack = name => db.tracks.delete(name).catch(e => console.error(`Oops, there was a problem: ${e.message}`));