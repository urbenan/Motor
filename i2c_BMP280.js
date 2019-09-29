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


function convertBytesToValue(bytes) {
  let value = ((bytes[0] & 0xff) << 8) | ((bytes[1] & 0xff));
  return value;
}







function convertBytesToShortValue(bytes) {
  let value = ((bytes[0] & 0xff)) | ((bytes[1] & 0xff)<<8);
  if ((value & 0x8000) !== 0) {
    value=value-( 1 << 16);
  }
  return value;
}

function convertBytesToUnsignetShortValue(bytes) {
  let value = ((bytes[0] & 0xff)) | ((bytes[1] & 0xff)<<8);
  return value;
}
/*
function convertBytesToLongValue(bytes) {
  let value = ((bytes[0] & 0xff) << 16) | ((bytes[1] & 0xff) << 8) | ((bytes[2] & 0xff));
  // if ((value & 0x80000) !== 0) {
  //  value -= 1 << 24;
  // }
  return value;
}
*/

function convertBytesToLongValue(bytes) {
  let value = ((bytes[0] & 0xff) << 12) | ((bytes[1] & 0xff) << 4) | ((bytes[2] & 0xff));
  // if ((value & 0x80000) !== 0) {
  //  value -= 1 << 24;
  // }
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
  i2c1.writeByteSync(I2C_ADDR, 0xF4, 0x27);
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

  let var1=0;
  let var2=0;
  let t_fine=0;
  let temp=0;

  let bytes = Buffer.alloc(6);
  let ADSValue=0;
  let voltage=0;
  let id=0x0;
  let temp_msb=0x00;
  let temp_lsb=0x00;
  let temp_xlsb=0x00;
  let adc_T_0x000;
  let adc_T=0;

  let dig_T1=0; 
  let dig_T2=0;
  let dig_T3=0;

  let dig_T1_hex=0x00; 
  let dig_T2_hex=0x00;
  let dig_T3_hex=0x00;

  bytes1=Buffer.alloc(2);
  bytes2=Buffer.alloc(2);
  bytes3=Buffer.alloc(2);

  i2c1.readI2cBlockSync(I2C_ADDR, 0x88, 2 , bytes1);
  dig_T1_hex=bytes1;
  i2c1.readI2cBlockSync(I2C_ADDR, 0x8A, 2 , bytes2);
  dig_T2_hex=bytes2;
  i2c1.readI2cBlockSync(I2C_ADDR, 0x8C, 2 , bytes3);
  dig_T3_hex=bytes3;

  dig_T1=convertBytesToUnsignetShortValue(dig_T1_hex);
  dig_T2=convertBytesToShortValue(dig_T2_hex);
  dig_T3=convertBytesToShortValue(dig_T3_hex);

/*
  bytes=Buffer.alloc(6);
  i2c1.readI2cBlockSync(I2C_ADDR, PRESS_REG, 6 , bytes);
  temp_msb=bytes[3];
  temp_lsb=bytes[4];
  temp_xlsb=bytes[5];
*/

  bytes=Buffer.alloc(3);
  i2c1.readI2cBlockSync(I2C_ADDR, 0xFA, 3 , bytes)
  adc_T_hex=bytes;
  adc_T=convertBytesToLongValue(adc_T_hex);

  temp_msb=bytes[0];
  temp_lsb=bytes[1];
  temp_xlsb=bytes[2];

  id = convertByteToHex(bytes);

  // Temp berechnung
  // dig_T1=27504;
  // dig_T2=26435;
  // dig_T3=-1000;
  // adc_T=519888;
  //      dig_T2=-32357;

  var1=((adc_T/16384)-(dig_T1/1024))*(dig_T2);
  var2=(((adc_T/131072)-(dig_T1/8192))*((adc_T/131072)-(dig_T1/8192)))*dig_T3; 

  temp=(var1+var2)/5120;


  console.log(bytes);
  console.log("temp_msb:"+temp_msb);
  console.log("temp_lsb:"+temp_lsb);
  console.log("temp_xlsb:"+temp_xlsb);
  console.log("adc_T:"+adc_T);

  console.log("dig_T1:"+dig_T1);
  console.log("dig_T2:"+dig_T2);
  console.log("dig_T3:"+dig_T3);

  console.log("Temp [C]:"+temp);

  console.log("var1:"+var1);
  console.log("var2:"+var2);


  console.log(bytes);
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