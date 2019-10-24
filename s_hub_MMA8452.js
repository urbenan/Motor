//===============================================
// Websocket Server
// Data Beschleunigung
// Programmiert: Andreas Urben 2019
//===============================================

const i2c = require('i2c-bus');

var accX_g=0;

// ----------------- Web Server ------------
const https = require('https');
const fs = require('fs');
var connect = require('connect');
var serveStatic = require('serve-static');

var index = fs.readFileSync('sensor.html');

/*
const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};
*/

const options = {
  // key: fs.readFileSync('cert/zertifikat-key.pem'),
  // cert: fs.readFileSync('cert/zertifikat-pub.pem')
  key: fs.readFileSync('cert/serverkey.pem'),
  cert: fs.readFileSync('cert/servercert.pem')
};



var app = connect();

app.use(serveStatic(__dirname))
server = https.createServer(options, app).listen(8080);


// ----------------- Websocket-Server Hub ------------------
const WebSocket = require('ws');
// var WebSocketServer = require('ws').Server;
// var wss = new WebSocketServer({host: 'home.pi.ch',port: 8080, rejectUnauthorized: false});


const wss = new WebSocket.Server({ server });
//  var wss = new WebSocketServer({host: server ,port: 8000, 
//    rejectUnauthorized: false
//  });



/*
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({
    server: "https://192.168.4.1", port: 8000
});
*/



var clients=[];
clients.push("");


wss.addListener("connection",function(ws) {
  var clientID;
  console.log('client verbunden...');
  clients.push(ws);
  clientID=clients.length-1;
  // ws.send("Ein neuer Benutzer ist eingetreten");
  ws.send("0;"+clientID+";setClientID;"+clientID);


    function IvSend(){
       ws.send("0"+";"+"*"+";"+"accX"+";"+accX_g);
    }

    setInterval(IvSend, 100);



  ws.addListener("message",function(message) {
    var messageArray=message.split(";");
    var senderID=messageArray[0];
    var receiverID=messageArray[1];
    var parameterName=messageArray[2];
    var parameterValue=messageArray[3];
    console.log("m:"+message);

    if(parameterName=="k1" && parameterValue=="on"){
      knopf_1 = 1;
      // motor_direction=1
      // step_direction=1;
      // step_target=1;
      
      // GPIO_17.writeSync(0);
      // GPIO_18.writeSync(1);
      
    }

    if(parameterName=="k2" && parameterValue=="on"){
      knopf_2 = 1;
      // motor_direction=-1;
      // step_direction=-1;
      // step_target=1;
      
      // GPIO_17.writeSync(1);
      // GPIO_18.writeSync(0);
      
    }

    if(parameterName=="k1" && parameterValue=="off"){
      knopf_1 = 0;
      // motor_direction=0;
      // step_target=0;
      
      // GPIO_17.writeSync(0);
      // GPIO_18.writeSync(0);
    }

    if(parameterName=="k2" && parameterValue=="off"){
      knopf_2 = 0;
      // motor_direction=0;
      // step_target=0;
      
      // GPIO_17.writeSync(0);
      // GPIO_18.writeSync(0);
    }
    
    if(parameterName=="s1"){
        dutyCycle = parameterValue;
    }

    if(parameterName=="rx"){
        rx = parameterValue;
    }


    for(var i = 1; i < clients.length; i++) {
      if (clients[i]!=null) {
        clients[i].send(senderID+";"+i+";"+parameterName+";"+parameterValue);

        clients[i].send(senderID+";"+i+";"+"accX"+";"+accX_g);
      }
    }

/*
    function IvSend(){
       clients[1].send("0"+";"+"*"+";"+"accX"+";"+accX_g);
    }

    setInterval(IvSend, 100);
*/

  });

  ws.addListener("close", function () {
    // emitted when server or client closes connection
    var message;
    for(var i = 1; i < clients.length; i++) {
      // # Remove from our connections list so we don't send
      // # to a dead socket
      if(clients[i] == ws) {
        // clients.splice(i);
        clients[i]=null;


        for(var n = 1; n < clients.length; n++) {
          if (clients[n]!=null) {
            message=i+";"+n+";closeConnection;"+i;
            clients[n].send(message);
            console.log(message);
          }
        }

        break;


      }
    }
  });

});



// ------- Websocket Client ---------------------------------------
/*
const client = new WebSocket("wss://home.pi.ch:8080");
client.on("open", clientWSopen);
client.on("close", clientWSclose);
client.on("message", clientWSmessage);

  
function clientWSopen(){
  console.log("Client Connected");
}

function clientWSclose(){
}

function clientWSmessage(evt) {
     messageArray=(evt.data).split(";");
     senderID=parseInt(messageArray[0]);
     receiverID=parseInt(messageArray[1]);
     parameterName=messageArray[2];
     parameterValue=messageArray[3];

     if(parameterName=="setClientID" ) {
       clientID=parseInt(parameterValue);
       writeToScreen("setClientID="+clientID);
       message=clientID+";*;confirmClientID;"+clientID;
       websocket.send(message);
     }
}
*/

// client.send(senderID+";"+"*"+";"+"accX"+";"+accX_g);




// ------- I2C MMA8452 read accleration X, Y, Z -------------------

function readDataMMA8452(){
  const I2C_ADDR = 0x1C;  
  const i2c1 = i2c.openSync(1);
  const accMax=4;   // max accceleration +/-4 g
  const resADC=12;  // Max bit of ADC
  
  // Set Config Register
  const bytesConfig= Buffer.from([0b00000001]);
  i2c1.writeI2cBlockSync(I2C_ADDR, 0x2A, 1 , bytesConfig); 

  // Waiting for ready of Data reading 
  while (i2c1.readByteSync(I2C_ADDR, 0x00) === 0) {
  }

  // Reading accleration of X, Y, Z 
  let var1=0;
  let var2=0;
  let t_fine=0;

  let bytes = Buffer.alloc(6);

  let dig_X=0; 
  let dig_Y=0;
  let dig_Z=0;

  let accX=0;
  let accY=0;
  let accZ=0;

  bytes1=Buffer.alloc(2);
  bytes2=Buffer.alloc(2);
  bytes3=Buffer.alloc(2);

  const rawData=i2c1.readByteSync(I2C_ADDR, 0x0C);

  i2c1.readI2cBlockSync(I2C_ADDR, 0x01, 2 , bytes1);
  dig_X=bytes1.readInt16BE();
  i2c1.readI2cBlockSync(I2C_ADDR, 0x03, 2 , bytes2);
  dig_Y=bytes2.readInt16BE();
  i2c1.readI2cBlockSync(I2C_ADDR, 0x05, 2 , bytes3);
  dig_Z=bytes3.readInt16BE();

  accX=dig_X/Math.pow(2,resADC)/accMax;
  accY=dig_Y/Math.pow(2,resADC)/accMax;
  accZ=dig_Z/Math.pow(2,resADC)/accMax;

  // Consol Log 
  console.log("raw:"+rawData);
  console.log("dig_X:"+dig_X);
  console.log("dig_Y:"+dig_Y);
  console.log("dig_Z:"+dig_Z);
  console.log("acc X:"+accX);
  console.log("acc Y:"+accY);
  console.log("acc Z:"+accZ);
  
  accX_g=accX;
  

  i2c1.closeSync();
}

  setInterval(readDataMMA8452, 100);
// client.send("0"+";"+"*"+";"+"accX"+";"+accX_g);


// readDataMMA8452();











