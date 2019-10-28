//===============================================
// I2C Digital Analog Converter 
// MCP4725 12Bit DAC
// Programmiert: Andreas Urben 2019
//===============================================

const i2c = require('i2c-bus');

// write Data  V_out=(V_ref x Dn)/4096

let Dn=0;
let n=0;

// 4010->20mA
//  810-> 4mA

// 0.0051813
// Dn=((mA-4)/0.0051813)+785     12mA

while (Dn<=4095) {
  writeData(Math.floor(((8.2-4)/(16/(4010-810)))+810));
  // writeData(4010); 
  Dn=Dn+1;
  while (n<10000000) {
    n++;
  }
  n=0;
}

function writeData(Dn){
  const I2C_ADDR = 0x62;   //0x60
  // const I2C_ADDR = 0x76;

  const i2c1 = i2c.openSync(1);
  const resADC=12;  // Max bit of 
  let V_ref=3.3;    // VDD
  let V_out=1.5;
  // let Dn=(V_out*4096)/V_ref;   // Input Code
  let bytesData = Buffer.alloc(2);

  // const bytes = [(config >> 8) & 0xFF, config & 0xFF];
  //   let value = ((bytes[0] & 0xff) << 12) | ((bytes[1] & 0xff) << 4) | 

  // Dn=Math.floor(4095/4);
  //Dn=4095;
  let log="";
  let logStr="";
  let log1=0b00000000;
  let log2=0b00000000;
  let log3=0b00000000;


  log=(Dn).toString(2);
  
  log1=parseInt(log,2)<<4;
  // log1=log1<<4;
  logStr=log1.toString(2);
  
  if(Dn>15){ 
    log2=parseInt(logStr.substring(0,8-(16-logStr.length)),2);
    log3=parseInt(logStr.substring(8-(16-logStr.length),16),2);
  }
  if(Dn<=15){ 
    log2=0b00000000;
    log3=parseInt(logStr,2);
  }



  bytesData[0]=log2;
  bytesData[1]=log3;

  // bytesData.writeUInt16LE(Dn,0,2);
  // const bytesData= Buffer.from([log2, log3]);
  
  // Set Data Register            12345678,   12345678
  // const bytesData= Buffer.from([0b01111111, 0b11110000]);
  // const bytesData= Buffer.from([0b01111111, 0b11000000]);
     // const bytesData= Buffer.from([0b11111111, 0b11110000]);
  i2c1.writeI2cBlockSync(I2C_ADDR, 0x40, 2, bytesData); 
  console.log(log1.toString(2));
  console.log(log2.toString(2));
  console.log(log3.toString(2));

  console.log(logStr.length);
  
}
