const https = require('https');
const fs = require('fs');
var connect = require('connect');
var serveStatic = require('serve-static');

var index = fs.readFileSync('sensor.html');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

var app = connect();

app.use(serveStatic(__dirname))
server = https.createServer(options, app)
server.listen(8080);




// const fs = require('fs');
// const https = require('https');
const WebSocket = require('ws');
 
/*
const server = https.createServer({
  cert: fs.readFileSync('cert.pem'),
  key: fs.readFileSync('key.pem')
});
*/

// const wss = new WebSocket.Server({ server });
const wss = new WebSocket.Server({server}, rejectUnauthorized: false});
 
wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
 
  ws.send('something');
});
