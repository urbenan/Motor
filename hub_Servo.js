//===============================================
// Websocket Server
// Data Hub
// Programmiert: Andreas Urben 2019
//===============================================

// ----------------- Websocket-Server Hub --------------------------------------
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({host: '192.168.4.1',port: 8000});
// var wss = new WebSocketServer({host: '192.168.1.40',port: 8000});



var clients=[];
clients.push("");


wss.addListener("connection",function(ws) {
  var clientID;
  console.log('client verbunden...');
  clients.push(ws);
  clientID=clients.length-1;
  // ws.send("Ein neuer Benutzer ist eingetreten");
  ws.send("0;"+clientID+";setClientID;"+clientID);

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
      knopf_2 = 0;
      dutyCycle = parameterValue;
      // motor_direction=0;
      // step_target=0;
      
      // GPIO_17.writeSync(0);
      // GPIO_18.writeSync(0);
    }


    for(var i = 1; i < clients.length; i++) {
      if (clients[i]!=null) {
        clients[i].send(senderID+";"+i+";"+parameterName+";"+parameterValue);
      }
    }
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

// ------------------------------- Motor Steuerung GPIO ------------------------
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

var step_number=0; // Total Steps
var step_current=2; // Current Motor Step 1,2,3,4
var step_target=1000; // Target Steps
var step_direction=1; // left:-1, right:1

var motor_direction=0;
var dutyCycle=1;

// step_off();

// Toggle the state of the LED on GPIO #7 every 200ms.
// Here synchronous methods are used. Asynchronous methods are also available.
// iv=setInterval(drive,3);
//iv=setInterval(driveServo,3);
iv=setInterval(driveMotorShield,3);


function setTarget() {
  step_target=100;
//  step_direction=step_direction*-1;
  step_number=0;

//  step_off();
//  console.log("Interval Start");
}

// Stop blinking the LED and turn it off after 5 seconds.
/*
setTimeout(function () {
  clearInterval(iv); // Stop blinking
  GPIO_07.writeSync(0);  // Turn LED off.
  GPIO_07.unexport();    // Unexport GPIO and free resources
  GPIO_08.writeSync(0);  // Turn LED off.
  GPIO_08.unexport();    // Unexport GPIO and free resources
  GPIO_09.writeSync(0);  // Turn LED off.
  GPIO_09.unexport();    // Unexport GPIO and free resources
  GPIO_10.writeSync(0);  // Turn LED off.
  GPIO_10.unexport();    // Unexport GPIO and free resources
}, 5000);
*/

function step_off() {
  GPIO_07.writeSync(0);
  GPIO_08.writeSync(0);
  GPIO_09.writeSync(0);
  GPIO_10.writeSync(0);
}


function step_1() {
  GPIO_07.writeSync(1);
  GPIO_08.writeSync(0);
  GPIO_09.writeSync(0);
  GPIO_10.writeSync(1);
}

function step_2() {
    GPIO_07.writeSync(0);
    GPIO_08.writeSync(1);
    GPIO_09.writeSync(0);
    GPIO_10.writeSync(1);
}

function step_3() {
  GPIO_07.writeSync(0);
  GPIO_08.writeSync(1);
  GPIO_09.writeSync(1);
  GPIO_10.writeSync(0);
}

function step_4() {
  GPIO_07.writeSync(1);
  GPIO_08.writeSync(0);
  GPIO_09.writeSync(1);
  GPIO_10.writeSync(0);
}


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


/*
  if(motor_direction==1) {
    GPIO_17.writeSync(0);  // Direction
    GPIO_18.writeSync(1);  // Brake
    GPIO_02.writeSync(1);  // pwm
  }

  if(motor_direction==-1) {
    GPIO_17.writeSync(1);  // Direction
    GPIO_18.writeSync(0);  // Brake
    GPIO_02.writeSync(1);  // pwm
  }

  if(motor_direction==0) {
    GPIO_17.writeSync(0);  // Direction
    GPIO_18.writeSync(0);  // Brake
    GPIO_02.writeSync(0);  // pwm
  }
 */

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
  
  dutyCycle=255; //0-255

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
  
  if(knopf_1 == 1 && knopf_2 == 0){
     pulseWidth=pulseWidth-1;
  }
  
  if(knopf_1 == 0 && knopf_2 == 1){
     pulseWidth=pulseWidth+1;
  }
  
  
  if (pulseWidth >= 2000) {
    pulseWidth=2000;
   // increment = -100;
 } else if (pulseWidth <= 1000) {
   pulseWidth=1000;
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




// ------------------------------- Web Server ----------------------------------
var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(8080);
