const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const fs = require('fs');
const db = require('./db');
const { analyze } = require('./bpm');
var AudioContext = require('web-audio-api').AudioContext
  , audioCtx = new AudioContext

db.init(); // async

app.use(express.json()) // for parsing req.body
app.use(fileUpload()); // for simplified processing of

// for CORS support
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Cache-Control, Key, Access-Control-Allow-Origin");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

// setup our API routes that will be used by the client (browser)
const API_PATH = `${__dirname}/api`;
const ASSET_PATH = `${API_PATH}/assets/`;
const UPLOAD_PATH = `${API_PATH}/uploads/`;

// assets are things like favicon, images, etc, not bundled by webpack
app.use('/api/assets', express.static(ASSET_PATH));

// upload dir for incoming tracks
app.post('/api/upload', (req, res) => {
  console.log('FILES:', req.files)
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  for (let file in req.files) {
    const track = req.files[file]
    if (track.size > 3e+7) return res.status(413).send('Track exceeds 30mb limit.')

    const filename = `${UPLOAD_PATH}/${track.name}`

    track.mv(filename, err => {
      if (err)
        return res.status(500).send(err)
    })
    /*
    const trackb = track.data
    const audioBuffer = trackb.buffer.slice(trackb.byteOffset, trackb.byteOffset + trackb.byteLength)
    */

    audioCtx.decodeAudioData(track.data).then(audioBuffer => {
      analyze(audioBuffer)
        .then(data => {
          console.log({ data })

          const { sampleRate, duration, peaks, bpm } = data;

        })
        .catch(e => console.error(`Error during audio analysis: ${e}`))
    }).catch(e => console.error(e));



    console.log(`${track.name} uploaded!`)


  }



  res.send('Upload successful!')


})

app.delete('/api/track', (req, res) => {
  if (!req.body || !req.body.name) return res.status(500).send('You must provide a track name to delete');

  fs.unlink(`${UPLOAD_PATH}/${req.body.name}`, err => {
    if (err) return res.status(500).send(err);
    return res.status(200).send('Track deleted!');
  })
})

app.get('/api/tracks', (req, res) => fs.readdir(UPLOAD_PATH, (err, files) => res.send(files)));

// listen for requests :)
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Server is listening on port ' + listener.address().port);
});
