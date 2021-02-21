const mongoose = require('mongoose');
const DB_URI = 'mongodb://localhost';

let Track, Mix, Set;

const init = () => {
  mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const db = mongoose.connection;

  db.on('error', console.error.bind(console, 'db connection error:'));
  db.once('open', function () {
    console.log(`Connected to database @ ${DB_URI}`);

    const trackSchema = new mongoose.Schema({
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
    });

    Track = mongoose.model('Track', trackSchema);

  });
}

module.exports = { init, Track, Mix, Set };