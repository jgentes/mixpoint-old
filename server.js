const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const fs = require('fs');

// for CORS support
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Cache-Control, Key, Access-Control-Allow-Origin");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

app.use(fileUpload({
  useTempFiles: true
}));

const API_PATH = `${__dirname}/api`;
const ASSET_PATH = `${API_PATH}/assets/`;
const UPLOAD_PATH = `${API_PATH}/uploads/`;

app.use('/api/assets', express.static(ASSET_PATH));

app.post('/api/upload', (req, res) => {
  console.log('REQ:', req.files);
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  console.log('files:', req.files);

  for (let file in req.files) {
    const track = req.files[file];
    if (track.size > 3e+7) return res.status(413).send('Track exceeds 30mb limit.');

    track.mv(`${UPLOAD_PATH}/${track.name}`, err => {
      if (err)
        return res.status(500).send(err);
    });
  }

  res.send('Track uploaded!');
})

app.delete('/api/track', (req, res) => {

  console.log('DELETE REQ BODY:', req.body);
  return res.status(500)
})

app.get('/api/tracks', (req, res) => fs.readdir(UPLOAD_PATH, (err, files) => res.send(files)));

// listen for requests :)
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Server is listening on port ' + listener.address().port);
});
