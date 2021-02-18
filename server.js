const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

// for CORS support
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Cache-Control, Key, Access-Control-Allow-Origin");
  next();
});

app.use(fileUpload({
  abortOnLimit: true,
  useTempFiles: true,
  limits: { fileSize: 3e+7 }, // 30mb
}));

const UPLOADPATH = `${__dirname}/uploads/`;

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.post('/upload', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  console.log('files:', req.files);

  for (let file in req.files) {
    const track = req.files[file];
    track.mv(`${UPLOADPATH}/${track.name}`, err => {
      if (err)
        return res.status(500).send(err);
    });
  }

  res.send('File uploaded!');
})

app.delete('/upload', (req, res) => {
  let sampleFile;
  console.log('DELETE REQ BODY:', req.body);

  /* 
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    sampleFile = req.files.sampleFile;
    uploadPath = __dirname + '/uploads/' + sampleFile.name;
  
    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(uploadPath, function (err) {
      if (err)
        return res.status(500).send(err);
  
      res.send('File uploaded!');
    }); */
})

// listen for requests :)
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Server is listening on port ' + listener.address().port);
});
