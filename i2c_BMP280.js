const i2c = require('i2c-bus');
 
const I2C_ADDR = 0x76;
const ID_REG = 0xD0;
const CONFIG_REG = 0xF5;
const PRESS_REG = 0xF7;



// const BMP280_ADDR = 0x48;

// const CMD_ACCESS_CONFIG = 0x00;
// const CMD_READ_TEMP = 0x00;
// const CMD_START_CONVERT = 0x00;

// const CMD_ACCESS_CONFIG = 0xAC;
// const CMD_READ_TEMP = 0xAA;
// const CMD_START_CONVERT = 0xEE;

const toCelsius = (rawData) => {
  rawData = (rawData >> 8) + ((rawData & 0xff) << 8);
  let celsius = (rawData & 0x0fff) / 16;
  if (rawData & 0x1000) {
    celsius -= 256;
  }
  return celsius;
};
 
const toInt = (rawData) => {
  return parseInt(rawData, 16);
}

function convertADSValue(bytes) {
  let value = ((bytes[0] & 0xff) << 8) | ((bytes[1] & 0xff));
  if ((value & 0x8000) !== 0) {
    value -= 1 << 16;
  }
  return value;
}

function convertByteToHex(bytes) {
  let value = bytes[0]; // & 0xff;
  return value;
}


function getVoltageFromValue(value) {
  let max=0;
  let ADS1115_MAX_RANGE=32768.0  // 2^(16-1) // 16bit, -32768 to 32767
  if (value > 0) { 
    max = ADS1115_MAX_RANGE - 1;
  } else {
    max = ADS1115_MAX_RANGE; 
  }
  // return value / max * 2.048; // value / mx = % of scale, scale * pga = Volts 
  return value / max * 4.096; // value / mx = % of scale, scale * pga = Volts
}




const i2c1 = i2c.openSync(1);

// i2c1.writeByteSync(BMP280_ADDR, CMD_ACCESS_CONFIG, 0x01);

// while (i2c1.readByteSync(BMP280_ADDR, CMD_ACCESS_CONFIG) & 0x10) {
// }

// i2c1.writeByteSync(BMP280_ADDR, CMD_START_CONVERT, 0x00);

// while (i2c1.readByteSync(BMP280_ADDR, CMD_ACCESS_CONFIG) & 0x10) {
// }

// while ((i2c1.readByteSync(BMP280_ADDR, CMD_ACCESS_CONFIG) & 0x80) === 0) {
// }

// const rawData =i2c1.readWordSync(BMP280_ADDR, CMD_READ_TEMP);
// console.log(rawData);



function writeConfigRegister() {
  // var config = 0xC583;
  var config = 0x27;
  // const bytes = [config & 0xFF];
  const bytes = [config];
  // i2c1.writeI2cBlockSync(I2C_ADDR, 0xF4, 1, Buffer.from(bytes));
  // i2c1.writeByteSync(I2C_ADDR, 0xF4, 0x27);
}


writeConfigRegister();


// setTimeout(myRead,(1000/250)+1); //default
// setTimeout(myRead,(1000/8)+1);
// myRead();

while (i2c1.readByteSync(I2C_ADDR, 0xF3) === 0) {
}

// setTimeout(myRead,(10000/250)+1); //default

myRead();

function myRead() {

  let bytes = Buffer.alloc(6);
  let ADSValue=0;
  let voltage=0;
  let id=0x0;
  var temp_msb = 0x00;
  var temp_lsb = 0x00;
  var temp_xlsb = 0x00;
  

  i2c1.readI2cBlockSync(I2C_ADDR, PRESS_REG, 6 , bytes);
  temp_msb = bytes[3];
  temp_lsb = bytes[4];
  temp_xlsb = bytes[5];


  id = convertByteToHex(bytes);
  console.log(bytes);
  console.log(temp_msb);
  console.log(temp_lsb);
  console.log(temp_xlsb);
/*
  const rawData =i2c1.readI2cBlockSync(I2C_ADDR, 0x00, 2 , bytes);
  console.log(getVoltageFromValue(rawData));
  console.log(bytes[1]);
  console.log(bytes[2]);
  valueADS = convertADSValue(bytes);
  voltage = getVoltageFromValue(valueADS) 

  console.log(valueADS);
  console.log(voltage);
*/

}


i2c1.closeSync();