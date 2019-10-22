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

function calcTempFromVoltage(voltage) {
  const R_1=10000
  const U_VCC=3.3;
  const NTC_A=0.001129148;
  const NTC_B=0.000234125;
  const NTC_C=0.0000000876741;
  
  let U_1=voltage;
  let R_NTC=0;
  let temperatur;
  
  R_NTC=(U_VCC-U_1)/(U_1/R_1);

  temp_steinhart=(1/(NTC_A+NTC_B*Math.log(R_NTC)+(NTC_C*Math.pow(Math.log(R_NTC),3))))-273.15;
  return temp_steinhart;
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
  
  console.log(calcTempFromVoltage(voltage));
}


i2c1.closeSync();

