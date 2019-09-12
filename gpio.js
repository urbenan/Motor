//===============================================
// GPIO Steuerung
// 
// Programmiert: Andreas Urben 2019
//===============================================


// ------------------------------- Motor Steuerung GPIO ------------------------

var iv_start;

const Gpio = require('pigpio').Gpio;

const GPIO_02 = new Gpio(02, {mode: Gpio.OUTPUT}); 
const GPIO_10 = new Gpio(10, {mode: Gpio.OUTPUT});
const GPIO_17 = new Gpio(17, {mode: Gpio.OUTPUT});
const GPIO_18 = new Gpio(18, {mode: Gpio.OUTPUT});
 
var increment = 100;
var motor_direction=1;
var dutyCycle=1;


// iv=setInterval(driveMotorShield,10000);

iv_start=setInterval(start,10000);

function start() {
  motor_direction=1;
  dutyCycle=255;
  driveMotorShield();
  setTimeout(halten, 10)
  dutyCycle=155;
  driveMotorShield();
  setTimeout(stop, 3000)
}

function halten() {
  motor_direction=1;
  dutyCycle=155;
  driveMotorShield();
}

function stop() {
  motor_direction=0;
  dutyCycle=0;
  driveMotorShield();
}

function driveMotorShield() {

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

