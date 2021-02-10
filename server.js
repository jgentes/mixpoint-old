var qs = require('querystring');
var express = require('express');
var app = express();

// init Spotify API wrapper

var SpotifyWebApi = require('spotify-web-api-node');

var spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

const jssdkscopes = ["streaming", "user-read-email", "user-read-private", "user-modify-playback-state"];
const redirectUriParameters = {
  client_id: process.env.CLIENT_ID,
  response_type: 'token',
  scope: jssdkscopes.join(' '),
  redirect_uri: encodeURI('https://spotify-api-jgentes.glitch.me/'),
  show_dialog: true,
}

const redirectUri = `https://accounts.spotify.com/authorize?${qs.stringify(redirectUriParameters)}`;

function authenticate(callback) {
  spotifyApi.clientCredentialsGrant()
    .then(function (data) {
      console.log('The access token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + data.body['access_token']);

      callback instanceof Function && callback();

      // Save the access token so that it's used in future calls
      spotifyApi.setAccessToken(data.body['access_token']);
    }, function (err) {
      console.log('Something went wrong when retrieving an access token', err.message);
    });
}
authenticate();

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.get("/search", function (request, response) {
  reAuthenticateOnFailure((failure) => {
    spotifyApi.searchTracks(request.query.query, { limit: 2 })
      .then(function (data) {
        response.send(data.body);
      }, failure);
  })
});

const reAuthenticateOnFailure = (action) => {
  action(() => {
    authenticate(action);
  })
}

app.get("/spotifyRedirectUri", function (request, response) {
  response.send(JSON.stringify({
    redirectUri
  }, null, 2))
});

app.get("/features", function (request, response) {
  reAuthenticateOnFailure((failure) => {
    spotifyApi.getAudioFeaturesForTrack(request.query.id)
      .then(function (data) {
        response.send(data.body);
      }, failure);
  })
});

app.get("/analysis", function (request, response) {
  reAuthenticateOnFailure((failure) => {
    spotifyApi.getAudioAnalysisForTrack(request.query.id)
      .then(function (data) {
        response.send(data.body);
      }, failure);
  });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
