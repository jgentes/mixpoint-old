const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const fs = require('fs');

// for CORS support
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Cache-Control, Key, Access-Control-Allow-Origin");
  next();
});

app.use(fileUpload({
  useTempFiles: true
}));

const UPLOADPATH = `${__dirname}/uploads/`;

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.use(express.static('uploads'));

app.post('/upload', (req, res) => {
  console.log('REQ:', req.files);
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  console.log('files:', req.files);

  for (let file in req.files) {
    const track = req.files[file];
    if (track.size > 3e+7) return res.status(413).send('Track exceeds 30mb limit.');

    track.mv(`${UPLOADPATH}/${track.name}`, err => {
      if (err)
        return res.status(500).send(err);
    });
  }

  res.send('Track uploaded!');
})

app.delete('/upload', (req, res) => {

  console.log('DELETE REQ BODY:', req.body);

})

app.get('/tracks', (req, res) => fs.readdir(UPLOADPATH, (err, files) => res.send(files)));

// listen for requests :)
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Server is listening on port ' + listener.address().port);
});
