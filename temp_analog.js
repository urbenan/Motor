const i2c = require('i2c-bus');

const toInt = (rawData) => {
  return parseInt(rawData, 16);
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

function calcTemp(voltage) {
  let temperatur;
  temperatur=Math.log((10000/voltage)*(3300-voltage));
  temperatur=1/(0.001129148+(0.000234125+(0.0000000876741*temperatur*temperatur))*temperatur); 
  temperatur=temperatur-273.15;
  return temperatur;
}

const i2c1 = i2c.openSync(1);

function writeConfigRegister() {
  // let config = 0xC583;
  let config = 0xC383;
  const bytes = [(config >> 8) & 0xFF, config & 0xFF];

  const bytesConfig=Buffer.from([0b11000011,0b10000011]);

  i2c1.writeI2cBlockSync(0x48, 0x01, 2, Buffer.from(bytes));
}

writeConfigRegister();
// i2c1.writeWordSync(0x48, 0x01, 0x8583);  //default
// i2c1.writeWordSync(0x48, 0x01, 0xC583);  //0xC583

setTimeout(myRead,(1000/250)+1); //default
// setTimeout(myRead,(1000/8)+1);

function myRead() {
  let bytes = Buffer.alloc(15);
  let ADSValue=0;
  let voltage=0;

  const rawData =i2c1.readI2cBlockSync(0x48, 0x00, 2 , bytes);
  console.log(toInt(rawData));
  console.log(getVoltageFromValue(rawData));
  console.log(bytes[1]);
  console.log(bytes[2]);

  valueADS=bytes.readInt16BE();

  // valueADS = convertADSValue(bytes);
  voltage = getVoltageFromValue(valueADS) 

  console.log(valueADS);
  console.log(voltage);
  
  consol.log(calcTemp(
}


i2c1.closeSync();

