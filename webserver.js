const https = require('https');
const fs = require('fs');

var index = fs.readFileSync('sensor.html');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(options, function (req, res) {
  // res.writeHead(200);
  // res.end("hello world\n");
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(index);
  
}).listen(8080);


/*
var index = fs.readFileSync('index.html');


var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');

// This line is from the Node.js HTTPS documentation.
var options = {
  key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),
  cert: fs.readFileSync('test/fixtures/keys/agent2-cert.cert')
};

// Create a service (the app object is just a callback).
var app = express();

// Create an HTTP service.
http.createServer(app).listen(80);
// Create an HTTPS service identical to the HTTP service.
https.createServer(options, app).listen(443);
*/