const i2c = require('i2c-bus');
 
const I2C_ADDR = 0x76;

function convertBytesToLongValue(bytes) {
  let value = ((bytes[0] & 0xff) << 12) | ((bytes[1] & 0xff) << 4) | ((bytes[2] & 0xff));
  // if ((value & 0x80000) !== 0) {
  //  value -= 1 << 24;
  // }
  return value;
}

const i2c1 = i2c.openSync(1);

function writeConfigRegister() {
  const bytesConfig= Buffer.from([0b00100111]);
  i2c1.writeI2cBlockSync(I2C_ADDR, 0xF4, 1 , bytesConfig); 
}

writeConfigRegister();

// while (i2c1.readByteSync(I2C_ADDR, 0xF3) !== 0) {
// } 

// readData;
// setTimeout(readData,(10000/250)+1); //default
setTimeout(readData, 500);


function readData() {

  let var1=0;
  let var2=0;
  let t_fine=0;
  let temp=0;

  let bytes = Buffer.alloc(6);
  // let ADSValue=0;
  // let voltage=0;
  let id=0x0;
  let temp_msb=0x00;
  let temp_lsb=0x00;
  let temp_xlsb=0x00;
  let adc_T_0x000;
  let adc_T=0;

  let dig_T1=0; 
  let dig_T2=0;
  let dig_T3=0;

  bytes1=Buffer.alloc(2);
  bytes2=Buffer.alloc(2);
  bytes3=Buffer.alloc(2);

  i2c1.readI2cBlockSync(I2C_ADDR, 0x88, 2 , bytes1);
  dig_T1=bytes1.readUInt16LE();
  i2c1.readI2cBlockSync(I2C_ADDR, 0x8A, 2 , bytes2);
  dig_T2=bytes2.readInt16LE();
  i2c1.readI2cBlockSync(I2C_ADDR, 0x8C, 2 , bytes3);
  dig_T3=bytes3.readInt16LE();

  bytes=Buffer.alloc(3);
  i2c1.readI2cBlockSync(I2C_ADDR, 0xFA, 3 , bytes);
  adc_T_hex=bytes;
  adc_T=convertBytesToLongValue(adc_T_hex);

/*
  temp_msb=bytes[0];
  temp_lsb=bytes[1];
  temp_xlsb=bytes[2];
*/

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

}

i2c1.closeSync();