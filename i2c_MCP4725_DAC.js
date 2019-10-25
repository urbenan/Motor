//===============================================
// I2C Digital Analog Converter 
// MCP4725 12Bit DAC
// Programmiert: Andreas Urben 2019
//===============================================

const i2c = require('i2c-bus');

// write Data  V_out=(V_ref x Dn)/4096

function writeData(){
  const I2C_ADDR = 0x60;  
  const i2c1 = i2c.openSync(1);
  const accMax=4;   // max accceleration +/-4 g
  const resADC=12;  // Max bit of 
  let V_ref=3.3;    // VDD
  let V_out=1.5;
  let Dn=(V_out*4096)/V_ref;   // Input Code
  
  
  // Set Config Register            12345678,   12345678
  const bytesConfig= Buffer.from([0b10000000, 0b00000000]);
  i2c1.writeI2cBlockSync(I2C_ADDR, 0b01000000, 2, bytesConfig); 

  // Waiting for ready of Data reading 
  // while (i2c1.readByteSync(I2C_ADDR, 0x00) === 0) {
  // }

  // Write 12-Bit DAC Value
  
  
  /*
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
*/