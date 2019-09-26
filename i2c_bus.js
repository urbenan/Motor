const i2c = require('i2c-bus');
 
//const MCP9808_ADDR = 0x48;
// const TEMP_REG = 0xAA;
// const BMP280_ADDR = 0x76;
// const TEMP_REG = 0x8D;    //0x88 , 0xF6

const BMP280_ADDR = 0x48;

const CMD_ACCESS_CONFIG = 0x00;
const CMD_READ_TEMP = 0x00;
const CMD_START_CONVERT = 0x00;

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
  var config = 0xC383;
  const bytes = [(config >> 8) & 0xFF, config & 0xFF];
  i2c1.writeI2cBlockSync(0x48, 0x01, 2, Buffer.from(bytes));
}


writeConfigRegister();
// i2c1.writeWordSync(0x48, 0x01, 0x8583);  //default
// i2c1.writeWordSync(0x48, 0x01, 0xC583);  //0xC583

setTimeout(myRead,(1000/250)+1); //default
// setTimeout(myRead,(1000/8)+1);
// myRead();

function myRead() {
  let bytes = Buffer.alloc(15);
  let ADSValue=0;
  let voltage=0;

  const rawData =i2c1.readI2cBlockSync(0x48, 0x00, 2 , bytes);
//  const rawData =i2c1.readWordSync(0x48, 0x00);
  console.log(toInt(rawData));
  console.log(getVoltageFromValue(rawData));
  console.log(bytes[1]);
  console.log(bytes[2]);
  valueADS = convertADSValue(bytes);
  voltage = getVoltageFromValue(valueADS) 

  console.log(valueADS);
  console.log(voltage);
}


i2c1.closeSync();