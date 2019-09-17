//===============================================
// Websocket Server
// Data Hub
// Programmiert: Andreas Urben 2019
//===============================================

// ----------------- Web Server -----------------
const https = require('https');
const fs = require('fs');
var connect = require('connect');
var serveStatic = require('serve-static');

var index = fs.readFileSync('sensor.html');

const options = {
	key: fs.readFileSync('cert/zertifikat-key.pem'),
	cert: fs.readFileSync('cert/zertifikat-pub.pem')
};

var app = connect();

app.use(serveStatic(__dirname))
server = https.createServer(options, app).listen(8080);


// ----------------- Websocket-Server Hub --------
const WebSocket = require('ws');
// var WebSocketServer = require('ws').Server;
// var wss = new WebSocketServer({host: 'home.pi.ch',port: 8080, rejectUnauthorized: false});
const wss = new WebSocket.Server({ server });

var clients=[];
clients.push("");

ws = function() {
	var clientID;
	console.log('client verbunden...');
	clients.push(ws);
	clientID=clients.length-1;
	// ws.send("Ein neuer Benutzer ist eingetreten");
	send("0;"+clientID+";setClientID;"+clientID);
	ws.addListener("message", message);
	ws.addListener("close", close);
}

message = function() {
	var messageArray=message.split(";");
	var senderID=messageArray[0];
	var receiverID=messageArray[1];
	var parameterName=messageArray[2];
	var parameterValue=messageArray[3];
	console.log("m:"+message);

	if(parameterName=="k1" && parameterValue=="on"){
		knopf_1 = 1;
	}

	if(parameterName=="k2" && parameterValue=="on"){
		knopf_2 = 1;
	}

	if(parameterName=="k1" && parameterValue=="off"){
		knopf_1 = 0;
	}

	if(parameterName=="k2" && parameterValue=="off"){
		knopf_2 = 0;
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
    	}
	}
}

// ws.addListener("message", message );
wss.addListener("connection", ws );

close = function() {
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
}


// -------------------- Motor Steuerung GPIO -------------------
// var Gpio = require('onoff').Gpio, // Constructor function for Gpio objects.
//  GPIO_02 = new Gpio(2, 'out'),      // Export GPIO #2 as an output.
//  GPIO_07 = new Gpio(7, 'out'),      // Export GPIO #7 as an output.
//  GPIO_08 = new Gpio(8, 'out'),      // Export GPIO #8 as an output.
//  GPIO_09 = new Gpio(9, 'out'),      // Export GPIO #9 as an output.
//  GPIO_10 = new Gpio(10, 'out'),      // Export GPIO #10 as an output.
//  GPIO_17 = new Gpio(17, 'out'),      // Export GPIO #17 as an output.
//  GPIO_18 = new Gpio(18, 'out'),      // Export GPIO #18 as an output.

var iv,ivTarget;

const Gpio = require('pigpio').Gpio;


const GPIO_02 = new Gpio(02, {mode: Gpio.OUTPUT}); 

const GPIO_10 = new Gpio(10, {mode: Gpio.OUTPUT});

const GPIO_17 = new Gpio(17, {mode: Gpio.OUTPUT});
const GPIO_18 = new Gpio(18, {mode: Gpio.OUTPUT});
 
var pulseWidth = 1000;
var increment = 100;

var knopf_1 = 0;
var knopf_2 = 0;

var rx = 0;

var step_number=0; // Total Steps
var step_current=2; // Current Motor Step 1,2,3,4
var step_target=1000; // Target Steps
var step_direction=1; // left:-1, right:1

var motor_direction=0;
var dutyCycle=1;

iv=setInterval(driveMotorShield,3);
iv=setInterval(driveServo,3);

function driveMotor() {

  if(knopf_1 == 1 && knopf_2 == 0){
     motor_direction=1;
     
     dutyCycle+=1;
  }
  
  if(knopf_1 == 0 && knopf_2 == 1){
     motor_direction=-1;
     
     dutyCycle-=1;
  }
  
  if(knopf_1 == 0 && knopf_2 == 0){
     motor_direction=0;
  }
  
  if(dutyCycle > 255) {
    dutyCycle = 255;
  }
  
  if(dutyCycle < 0) {
    dutyCycle = 0;
  }
  
  GPIO_17.digitalWrite(1);
  GPIO_18.digitalWrite(0);
  GPIO_02.pwmWrite(dutyCycle);
}


function driveMotorShield() {

  if(knopf_1 == 1 && knopf_2 == 0){
     motor_direction=1;
  }
  
  if(knopf_1 == 0 && knopf_2 == 1){
     motor_direction=-1;
  }
  
  if(knopf_1 == 0 && knopf_2 == 0){
     motor_direction=0;
  }
  
  // dutyCycle=255; //0-255

  if(motor_direction==1) {
    GPIO_17.digitalWrite(0);     // Direction
    GPIO_18.digitalWrite(0);     // Brake
    GPIO_02.pwmWrite(dutyCycle); // pwm
  }
  
  if(motor_direction==-1) {
    GPIO_17.digitalWrite(1);     // Direction
    GPIO_18.digitalWrite(0);     // Brake
    GPIO_02.pwmWrite(dutyCycle); // pwm
  }
  
  if(motor_direction==0) {
    GPIO_17.digitalWrite(0);     // Direction
    GPIO_18.digitalWrite(1);     // Brake
    GPIO_02.pwmWrite(dutyCycle); // pwm
  }

}

function driveServo() {
  GPIO_10.servoWrite(pulseWidth);
 
  // pulseWidth += increment;
  
  
  /*
  if(knopf_1 == 1 && knopf_2 == 0){
     pulseWidth=pulseWidth-1;
  }
  
  if(knopf_1 == 0 && knopf_2 == 1){
     pulseWidth=pulseWidth+1;
  }
  */
  
  // pulseWidth=800+(rx*10) ;
  pulseWidth=600+(rx*12) ;
  if (rx<=4) {
    rx=4;
  }
  if (rx>=140) {
    rx=140;
  }
  
  
  if (pulseWidth >= 2000) {
    pulseWidth=2000;
   // increment = -100;
 } else if (pulseWidth <= 500) {
   pulseWidth=500;
   // increment = 100;
 }

}


function drive() {

 // console.log("Motor Step");
 if(step_target>0) {
  if(step_direction==1) {
    if(step_current==1) {
      step_2();
    }
    if(step_current==2) {
      step_3();
    }
    if(step_current==3) {
      step_4();
    }
    if(step_current==4) {
      step_1();
    }
    step_current=step_current+1;
    if(step_current>4) {
      step_current=1;
      step_number=step_number+1;
    }
    // step_number=step_number+1;
  }

  if(step_direction==-1) {
    if(step_current==4) {
      step_3();
    }
    if(step_current==3) {
      step_2();
    }
    if(step_current==2) {
      step_1();
    }
    if(step_current==1) {
      step_4();
    }
    step_current=step_current-1;
    if(step_current<1) {
      step_current=4;
      step_number=step_number+1;
    }
    // step_number=step_number+1;
  }
//  clearInterval(iv);
// step_off();
}
}