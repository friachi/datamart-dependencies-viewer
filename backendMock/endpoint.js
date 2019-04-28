//a nodejs REST endpoint that will return a JSON graph

const express = require('express');
var cors = require('cors');
const fs = require('fs');

const app = express();

//allow CORS on ALL routes
app.use(cors())


app.get('/api/:videoId', (req,res,nex) => {

var obj;
try {
  obj = JSON.parse(fs.readFileSync('./data/'+req.params.videoId, 'utf8'));
  res.send(obj);
  return;
} catch (err) {
  res.status(404).send(`Response 404: graph '${req.params.videoId}' is not found`);
}


});


app.listen(9191,()=> console.log('Listening on port 9191...'));