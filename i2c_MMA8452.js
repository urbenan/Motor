const i2c = require('i2c-bus');
 
const I2C_ADDR = 0x1C;

function convertBytesToLongValue(bytes) {
  let value = ((bytes[0] & 0xff) << 12) | ((bytes[1] & 0xff) << 4) | ((bytes[2] & 0xff));
  // if ((value & 0x80000) !== 0) {
  //  value -= 1 << 24;
  // }
  return value;
}

const i2c1 = i2c.openSync(1);


function writeConfigRegister() {
  const bytesConfig= Buffer.from([0b00000001]);
  // i2c1.writeI2cBlockSync(I2C_ADDR, 0xF4, 1 , bytesConfig); 
  i2c1.writeI2cBlockSync(I2C_ADDR, 0x2A, 1 , bytesConfig); 
 
}

writeConfigRegister();

while (i2c1.readByteSync(I2C_ADDR, 0x00) === 0) {
}

// setTimeout(readData,(10000/250)+1); //default

readData();

function readData() { 
  const accMax=4;   // max accceleration +/-4 g
  const resADC=12;  // Max Bit by ADC

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


/*
  bytes=Buffer.alloc(3);
  i2c1.readI2cBlockSync(I2C_ADDR, 0xFA, 3 , bytes);
  adc_T_hex=bytes;
  adc_T=convertBytesToLongValue(adc_T_hex);
*/


  accX=dig_X/Math.pow(2,resADC)/accMax;
  accY=dig_Y/Math.pow(2,resADC)/accMax;
  accZ=dig_Z/Math.pow(2,resADC)/accMax;

  console.log("raw:"+rawData);

  console.log("dig_X:"+dig_X);
  console.log("dig_Y:"+dig_Y);
  console.log("dig_Z:"+dig_Z);

  console.log("acc X:"+accX);
  console.log("acc Y:"+accY);
  console.log("acc Z:"+accZ);

}

i2c1.closeSync();